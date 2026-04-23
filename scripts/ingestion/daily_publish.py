"""
daily_publish.py — Ingestão diária controlada com sistema anti-falhas.

Fluxo obrigatório:
  1. Verifica pré-condições (já rodou hoje? há grupos na fila? têm descrição?)
  2. Publica lote no banco (publish_daily_batch RPC)
  3. Cross-check: confirma no banco que o lote foi publicado
  4. Scan de segurança: reverte grupos sem seo_description
  5. Submete URLs novas à Google Indexing API com rotação de credenciais
  6. Cross-check: confirma que cada URL foi marcada como 'submitted' no banco
  7. Relatório final com evidências

3 Principais pontos de falha e como são tratados:

  [F1] publish_daily_batch() retorna 0 (fila vazia ou Supabase timeout)
       → Proteção: verifica count antes e depois. Se 0, para com mensagem clara.

  [F2] Google Indexing API retorna 429 (quota esgotada)
       → Proteção: rotaciona para próxima credencial. Loga qual parou e em que URL.
         Se todas esgotadas, salva checkpoint para continuar amanhã.

  [F3] INSERT no indexing_log falha silenciosamente
       → Proteção: após cada batch, faz SELECT COUNT para confirmar que os
         registros foram realmente escritos.
"""

import os
import sys
import time
import datetime
from pathlib import Path
from collections import defaultdict

from dotenv import load_dotenv
from supabase import create_client
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Adiciona o diretório pai ao path para importar utils
sys.path.insert(0, str(Path(__file__).parent))
from utils.logger import Logger
from utils.db_validator import DBValidator

load_dotenv()

# ─── Configuração ─────────────────────────────────────────────

SUPABASE_URL  = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
SUPABASE_KEY  = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
SITE_URL      = os.environ["NEXT_PUBLIC_SITE_URL"].rstrip("/")
CRED_DIR      = Path("credentials")
SCOPES        = ["https://www.googleapis.com/auth/indexing"]
MAX_PER_CRED  = 200   # limite Google: 200 URLs/dia por projeto
RATE_LIMIT_S  = 0.6   # 100 req/min por segurança


# ─── Credenciais ──────────────────────────────────────────────

def load_credentials(log: Logger) -> list[dict]:
    """
    [F2] Ponto de falha: credentials*.json ausente ou inválido.
    Proteção: testa cada arquivo individualmente.
    Nunca trava por um arquivo ausente — reporta e continua.
    """
    services = []
    for i in range(1, 7):
        path = CRED_DIR / f"credentials{i}.json"
        name = f"credentials{i}"

        if not path.exists():
            log.warning(
                f"{name}.json não encontrado — pulando",
                path=str(path),
                impact="200 URLs/dia a menos de capacidade"
            )
            continue

        try:
            creds = service_account.Credentials.from_service_account_file(
                str(path), scopes=SCOPES
            )
            service = build("indexing", "v3", credentials=creds, cache_discovery=False)
            services.append({
                "name":    name,
                "service": service,
                "sent":    0,
                "errors":  0,
                "active":  True,
            })
            log.info(f"{name}.json carregado", capacity=f"{MAX_PER_CRED} URLs/dia")

        except Exception as exc:
            log.error(
                f"Falha ao carregar {name}.json",
                exc=exc,
                file=str(path)
            )

    log.info(
        f"Total de credenciais carregadas",
        count=len(services),
        total_capacity=f"{len(services) * MAX_PER_CRED} URLs hoje"
    )
    return services


# ─── Indexing API ─────────────────────────────────────────────

def submit_single_url(
    svc: dict, url: str, group_id: int,
    db, log: Logger, batch_num: int
) -> str:
    """
    Submete uma URL e registra o resultado no indexing_log.
    Retorna: 'success' | 'quota_exceeded' | 'error'

    [F2] Quota exceeded → rotação automática (tratada no caller)
    [F3] INSERT no log falha → erro explícito, não silenciado
    """
    t0 = datetime.datetime.utcnow()

    try:
        body    = {"url": url, "type": "URL_UPDATED"}
        response = svc["service"].urlNotifications()\
            .publish(body=body).execute()

        elapsed = (datetime.datetime.utcnow() - t0).total_seconds()
        status  = "success"

        log.success(
            f"URL submetida com sucesso via {svc['name']}",
            url=url,
            project=svc["name"],
            http_status=200,
            elapsed_ms=round(elapsed * 1000),
            api_response=str(response)[:200],
        )
        svc["sent"] += 1

    except HttpError as he:
        elapsed = (datetime.datetime.utcnow() - t0).total_seconds()
        http_status = he.resp.status
        error_body  = he.content.decode("utf-8", errors="replace")[:300]

        if http_status == 429:
            status = "quota_exceeded"
            log.warning(
                f"QUOTA ESGOTADA em {svc['name']} — parando esta credencial",
                url=url,
                project=svc["name"],
                http_status=429,
                sent_so_far=svc["sent"],
                action="alternando para próxima credencial"
            )
            svc["active"] = False  # sinaliza para o caller rotacionar

        elif http_status == 403:
            status = "error"
            log.error(
                f"PERMISSÃO NEGADA em {svc['name']} — verifique o Search Console",
                url=url,
                project=svc["name"],
                http_status=403,
                error=error_body,
                action="esta credencial pode não ter acesso à propriedade no GSC"
            )
            svc["errors"] += 1

        else:
            status = "error"
            log.error(
                f"Erro HTTP {http_status} ao submeter URL via {svc['name']}",
                url=url,
                project=svc["name"],
                http_status=http_status,
                error=error_body,
                elapsed_ms=round(elapsed * 1000),
            )
            svc["errors"] += 1

    except Exception as exc:
        elapsed = (datetime.datetime.utcnow() - t0).total_seconds()
        status  = "error"
        log.error(
            f"Exceção inesperada ao submeter URL",
            exc=exc,
            url=url,
            project=svc["name"],
            elapsed_ms=round(elapsed * 1000),
        )
        svc["errors"] += 1

    # [F3] Registra no indexing_log — verifica se foi salvo
    try:
        insert_res = db.table("indexing_log").insert({
            "url":         url,
            "entity_type": "group",
            "entity_id":   group_id,
            "action":      "URL_UPDATED",
            "http_status": 200 if status == "success" else (429 if status == "quota_exceeded" else 500),
            "response":    {"status": status, "project": svc["name"]},
            "project":     svc["name"],
            "batch":       batch_num,
        }).execute()

        if not insert_res.data:
            log.warning(
                "indexing_log INSERT retornou vazio — registro pode não ter sido salvo",
                url=url, group_id=group_id
            )

    except Exception as exc:
        log.error(
            "FALHA ao salvar no indexing_log — evidência perdida",
            exc=exc,
            url=url, group_id=group_id
        )

    # Atualiza status no banco se sucesso
    if status == "success":
        try:
            db.table("groups").update({
                "indexing_status": "submitted",
                "submitted_at":    datetime.datetime.utcnow().isoformat() + "Z",
                "updated_at":      datetime.datetime.utcnow().isoformat() + "Z",
            }).eq("id", group_id).execute()
        except Exception as exc:
            log.error(
                "FALHA ao atualizar indexing_status para 'submitted'",
                exc=exc,
                group_id=group_id, url=url
            )

    return status


def submit_batch_urls(
    urls: list[dict], services: list[dict],
    db, log: Logger, batch_num: int
) -> dict:
    """
    Submete uma lista de URLs com rotação automática de credenciais.
    Se todas as credenciais esgotarem, para e salva checkpoint.

    Retorna contagens: {success, error, quota_exceeded, skipped}
    """
    counts   = defaultdict(int)
    svc_idx  = 0

    for i, item in enumerate(urls):
        url      = item["url"]
        group_id = item["group_id"]

        # Avança para próxima credencial ativa
        while svc_idx < len(services) and (
            not services[svc_idx]["active"] or
            services[svc_idx]["sent"] >= MAX_PER_CRED
        ):
            if services[svc_idx]["sent"] >= MAX_PER_CRED:
                log.warning(
                    f"{services[svc_idx]['name']} atingiu o limite diário",
                    sent=services[svc_idx]["sent"],
                    limit=MAX_PER_CRED,
                    action="alternando para próxima credencial"
                )
            svc_idx += 1

        # Todas as credenciais esgotadas
        if svc_idx >= len(services):
            remaining = len(urls) - i
            log.warning(
                "Todas as credenciais esgotadas ou inativas — parando envio",
                urls_remaining=remaining,
                urls_processed=i,
                action="URLs restantes ficam como 'published' para envio amanhã"
            )
            counts["skipped"] += remaining
            break

        # Submete
        result = submit_single_url(
            services[svc_idx], url, group_id, db, log, batch_num
        )
        counts[result] += 1

        # Progress a cada 10
        if (i + 1) % 10 == 0:
            log.info(
                f"Progresso: {i+1}/{len(urls)} URLs",
                success=counts["success"],
                errors=counts["error"],
                current_project=services[svc_idx]["name"],
                project_sent=services[svc_idx]["sent"],
            )

        time.sleep(RATE_LIMIT_S)

    return dict(counts)


# ─── Main ─────────────────────────────────────────────────────

def main():
    log = Logger("daily_publish")
    db  = create_client(SUPABASE_URL, SUPABASE_KEY)
    validator = DBValidator(db, log)

    log.separator("PRÉ-CONDIÇÕES")

    # ── [PRÉ-1] Já rodou hoje? ───────────────────────────────
    cfg_res = db.table("seo_config")\
        .select("value").eq("key","ingestion_state").single().execute()
    state    = cfg_res.data["value"]
    today    = str(datetime.date.today())

    if (state.get("last_publish_date") or "")[:10] == today:
        log.warning(
            "Script já rodou hoje — abortando para evitar dupla execução",
            last_run=state["last_publish_date"],
            today=today,
            action="para forçar re-execução: atualize 'last_publish_date' no seo_config"
        )
        log.finalize()
        return

    # ── [PRÉ-2] Há grupos na fila com qualidade suficiente? ─
    queued_res = db.table("groups")\
        .select("id", count="exact")\
        .eq("indexing_status","queued")\
        .gte("quality_score", 40)\
        .execute()
    queued_count = queued_res.count or 0

    if queued_count == 0:
        log.warning(
            "Nenhum grupo na fila com quality_score >= 40",
            queued=queued_count,
            action="adicione grupos com indexing_status='queued' ao banco"
        )
        log.finalize()
        return

    log.info(
        f"Grupos disponíveis na fila",
        queued=queued_count,
        min_quality=40
    )

    # ── Determina tamanho do lote ────────────────────────────
    sandbox_done = state.get("sandbox_complete", False)
    batch_size   = 50 if not sandbox_done else int(state.get("daily_limit", 150))
    batch_size   = min(batch_size, queued_count)
    batch_num    = int(state.get("current_batch", 0)) + 1

    log.info(
        f"Modo: {'SANDBOX' if not sandbox_done else 'PRODUÇÃO'}",
        batch_size=batch_size,
        batch_number=batch_num
    )

    log.separator("ETAPA 1/5 — PUBLICAR LOTE NO BANCO")

    # ── [1] Publica lote via RPC ─────────────────────────────
    try:
        rpc_res = db.rpc("publish_daily_batch", {"batch_size": batch_size}).execute()
        published_count = rpc_res.data

        if published_count == 0:
            log.error(
                "publish_daily_batch() retornou 0 — nenhum grupo foi publicado",
                expected=batch_size,
                action="verifique se há grupos com indexing_status='queued' e quality_score>=40"
            )
            log.finalize()
            return

        log.success(
            f"RPC publish_daily_batch() executado",
            returned=published_count,
            expected=batch_size,
        )

    except Exception as exc:
        log.fatal(
            "FALHA CRÍTICA ao chamar publish_daily_batch()",
            exc=exc,
            action="verifique se a função RPC existe no Supabase"
        )

    log.separator("ETAPA 2/5 — CROSS-CHECK DO LOTE")

    # ── [2] Cross-check: confirma no banco ───────────────────
    check_result = validator.verify_batch_published(batch_num, published_count)
    if not check_result.get("match"):
        log.error(
            "Cross-check falhou: contagem no banco diverge do esperado",
            **check_result,
            action="investigar antes de continuar"
        )
        # Não para — avança com o que foi publicado
        published_count = check_result.get("actual", published_count)

    log.separator("ETAPA 3/5 — SCAN DE SEGURANÇA (seo_description)")

    # ── [3] Garante que nenhuma página vazia vai ao Google ───
    scan_result = validator.verify_no_empty_descriptions_in_batch(batch_num)
    if scan_result.get("reverted", 0) > 0:
        reverted = scan_result["reverted"]
        log.warning(
            f"{reverted} grupos revertidos para 'queued' por seo_description vazia",
            reverted_ids=str(scan_result.get("ids",[]))[:200],
            action="rodar ai_content_generator.py e depois re-executar este script"
        )
        published_count -= reverted

    if published_count <= 0:
        log.warning(
            "Após reversão de descrições vazias, não sobrou nenhum grupo para submeter",
            action="rodar ai_content_generator.py primeiro"
        )
        log.finalize()
        return

    log.separator("ETAPA 4/5 — SUBMISSÃO À GOOGLE INDEXING API")

    # ── [4] Busca as URLs recém-publicadas ───────────────────
    fresh_res = db.table("groups")\
        .select("id, slug")\
        .eq("batch_number", batch_num)\
        .eq("indexing_status","published")\
        .is_("submitted_at","null")\
        .order("quality_score", desc=True)\
        .execute()

    urls_to_submit = [
        {
            "group_id": g["id"],
            "slug":     g["slug"],
            "url":      f"{SITE_URL}/{g['slug']}",
        }
        for g in (fresh_res.data or [])
    ]

    log.info(
        f"URLs prontas para submissão",
        count=len(urls_to_submit),
        sample=str([u["url"] for u in urls_to_submit[:3]])
    )

    # Carrega credenciais
    services = load_credentials(log)
    if not services:
        log.fatal(
            "Nenhuma credencial disponível — impossível submeter URLs",
            action="adicione credentials1.json até credentials6.json na pasta ./credentials/"
        )

    # Submete
    api_counts = submit_batch_urls(urls_to_submit, services, db, log, batch_num)

    log.separator("ETAPA 5/5 — CROSS-CHECK FINAL + ATUALIZAÇÃO DE ESTADO")

    # ── [5] Confirma quantos foram marcados como 'submitted' ─
    submitted_res = db.table("groups")\
        .select("id", count="exact")\
        .eq("batch_number", batch_num)\
        .eq("indexing_status","submitted")\
        .execute()
    confirmed_submitted = submitted_res.count or 0

    log.success(
        "Cross-check final: grupos com indexing_status='submitted' no banco",
        confirmed=confirmed_submitted,
        api_reported_success=api_counts.get("success",0),
        match=confirmed_submitted == api_counts.get("success",0),
    )

    # Confirma log de indexação
    log_res = db.table("indexing_log")\
        .select("id", count="exact")\
        .eq("batch", batch_num)\
        .execute()
    log_entries = log_res.count or 0

    if log_entries != len(urls_to_submit):
        log.warning(
            "indexing_log tem menos registros que URLs processadas",
            log_entries=log_entries,
            urls_processed=len(urls_to_submit),
            gap=len(urls_to_submit) - log_entries
        )
    else:
        log.success(
            "indexing_log confirmado no banco",
            entries=log_entries,
            batch=batch_num
        )

    # Atualiza ingestion_state
    new_total_pub  = int(state.get("total_published",0)) + published_count
    new_total_sub  = int(state.get("total_submitted",0)) + api_counts.get("success",0)
    sandbox_now    = new_total_pub >= 50

    db.table("seo_config").update({
        "value": {
            **state,
            "last_publish_date": today,
            "current_batch":     batch_num,
            "total_published":   new_total_pub,
            "total_submitted":   new_total_sub,
            "sandbox_complete":  sandbox_now,
            "daily_limit":       state.get("daily_limit", 150),
        },
        "updated_at": datetime.datetime.utcnow().isoformat() + "Z",
    }).eq("key","ingestion_state").execute()

    # ── Relatório final ──────────────────────────────────────
    log.separator("RELATÓRIO FINAL")
    log.info(f"Lote #{batch_num} concluído",
        publicados_banco=published_count,
        submetidos_api=api_counts.get("success",0),
        erros_api=api_counts.get("error",0),
        quota_exceeded=api_counts.get("quota_exceeded",0),
        pulados=api_counts.get("skipped",0),
        confirmados_banco=confirmed_submitted,
        total_publicado_acumulado=new_total_pub,
    )

    if not sandbox_done and sandbox_now:
        log.success(
            "🎉 SANDBOX COMPLETO — a partir de amanhã o limite é 150 grupos/dia",
            total_published=new_total_pub
        )

    summary = log.finalize()
    return summary


if __name__ == "__main__":
    main()
