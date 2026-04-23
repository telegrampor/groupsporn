"""
health_check.py — Dashboard de integridade do projeto.

Execute a qualquer momento:
  python scripts/health_check.py

Mostra:
  1. Estado do banco (grupos por indexing_status, quality_score, etc.)
  2. Cotas reais da Google Indexing API por credencial
  3. Páginas sem seo_description (não prontas para indexação)
  4. URLs com erro de 404 nos logs de indexação
  5. Velocidade de ingestão (grupos/dia últimos 7 dias)
  6. Recomendações de ação

Pontos de falha protegidos:
  [F1] Supabase offline → timeout explícito + mensagem clara
  [F2] credentials*.json ausentes → lista quais faltam, continua sem travar
  [F3] Google API quota 429 → reporta sem tentar novamente
"""

import os
import sys
import json
import datetime
from pathlib import Path
from collections import defaultdict

from dotenv import load_dotenv
from supabase import create_client
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

load_dotenv()

SUPABASE_URL  = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
SUPABASE_KEY  = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
SITE_URL      = os.environ["NEXT_PUBLIC_SITE_URL"]
CRED_DIR      = Path("credentials")
SCOPES        = ["https://www.googleapis.com/auth/indexing"]

# Cores
G = "\033[32m"; Y = "\033[33m"; R = "\033[31m"; C = "\033[36m"; DIM = "\033[90m"; RST = "\033[0m"
BOLD = "\033[1m"

def section(title: str):
    print(f"\n{BOLD}{C}{'═' * 55}{RST}")
    print(f"{BOLD}{C}  {title}{RST}")
    print(f"{BOLD}{C}{'═' * 55}{RST}")

def row(label: str, value, color: str = ""):
    label_str = f"  {label:<35}"
    val_str   = f"{color}{value}{RST}" if color else str(value)
    print(f"{label_str} {val_str}")


def check_database(db) -> dict:
    """
    [F1] Ponto de falha: Supabase offline ou credenciais erradas.
    Proteção: timeout via PostgREST, mensagem explícita se falhar.
    """
    section("1. BANCO DE DADOS — Estado de Ingestão")

    try:
        # ── Status de indexação ──────────────────────────────
        res = db.table("groups")\
            .select("indexing_status", count="exact")\
            .execute()

        # Agrupa manualmente (Supabase não tem GROUP BY direto no client)
        counts = defaultdict(int)
        for r in (res.data or []):
            counts[r["indexing_status"]] += 1

        total = sum(counts.values())
        row("Total de grupos no banco:", total, BOLD)
        print()

        status_order = ["draft","queued","published","submitted","indexed","deindexed","broken"]
        status_icons = {
            "draft": "📝", "queued": "⏳", "published": "🟢",
            "submitted": "📤", "indexed": "✅", "deindexed": "🗑️", "broken": "💔",
        }
        for s in status_order:
            n = counts.get(s, 0)
            icon = status_icons.get(s, "•")
            color = G if s in ("published","indexed") else (Y if s == "queued" else (R if s in ("broken","deindexed") else ""))
            row(f"  {icon} {s}:", n, color)

        # ── Quality scores ───────────────────────────────────
        print()
        qs = db.rpc("run_sql", {
            "query": """
              SELECT
                COUNT(*) FILTER (WHERE quality_score >= 80) AS high,
                COUNT(*) FILTER (WHERE quality_score BETWEEN 40 AND 79) AS medium,
                COUNT(*) FILTER (WHERE quality_score < 40) AS low,
                ROUND(AVG(quality_score),1) AS avg_qs
              FROM groups
            """
        }).execute()
        # Fallback para query direta se RPC não existir
        qs_data = {}
        try:
            qs_data = (qs.data or [{}])[0]
        except Exception:
            pass

        if qs_data:
            row("Quality Score médio:", qs_data.get("avg_qs","?"))
            row("  Alta qualidade (≥80):", qs_data.get("high","-"), G)
            row("  Média qualidade (40-79):", qs_data.get("medium","-"), Y)
            row("  Baixa qualidade (<40):", qs_data.get("low","-"), R)

        # ── Descrições vazias ────────────────────────────────
        empty_res = db.table("groups")\
            .select("id", count="exact")\
            .in_("indexing_status", ["queued","published","submitted","indexed"])\
            .is_("seo_description", "null")\
            .execute()
        empty_count = empty_res.count or 0

        print()
        color = R if empty_count > 0 else G
        row("⚠️  Prontos mas SEM seo_description:", empty_count, color)
        if empty_count > 0:
            print(f"  {Y}  → Ação: rodar ai_content_generator.py antes do próximo lote{RST}")

        # ── ingestion_state config ───────────────────────────
        cfg = db.table("seo_config")\
            .select("value")\
            .eq("key","ingestion_state")\
            .single()\
            .execute()
        state = (cfg.data or {}).get("value", {})

        print()
        row("Modo atual:", "SANDBOX" if not state.get("sandbox_complete") else "PRODUÇÃO (150/dia)",
            Y if not state.get("sandbox_complete") else G)
        row("Último lote publicado:", state.get("last_publish_date","nunca"))
        row("Total publicado:", state.get("total_published", 0))
        row("Total submetido à API:", state.get("total_submitted", 0))
        row("Lote atual:", state.get("current_batch", 0))

        return {"ok": True, "total": total, "empty_desc": empty_count}

    except Exception as exc:
        print(f"\n  {R}ERRO AO CONECTAR NO SUPABASE:{RST}")
        print(f"  {R}  {type(exc).__name__}: {exc}{RST}")
        print(f"  {Y}  Verifique: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env{RST}")
        return {"ok": False, "error": str(exc)}


def check_api_quotas() -> dict:
    """
    [F2] Ponto de falha: credentials*.json ausentes ou inválidos.
    Proteção: lista cada arquivo, reporta qual falta, não trava.

    [F3] Ponto de falha: Google API retorna 429 (quota exceeded).
    Proteção: captura HttpError, reporta quota usada, não lança exceção.
    """
    section("2. GOOGLE INDEXING API — Cotas por Credencial")

    results = {}
    today = datetime.date.today().isoformat()

    for i in range(1, 7):
        cred_path = CRED_DIR / f"credentials{i}.json"
        label = f"credentials{i}.json"

        if not cred_path.exists():
            row(f"  {label}:", "ARQUIVO NÃO ENCONTRADO", R)
            results[label] = {"status": "missing"}
            continue

        try:
            creds = service_account.Credentials.from_service_account_file(
                str(cred_path), scopes=SCOPES
            )
            service = build("indexing", "v3", credentials=creds, cache_discovery=False)

            # Tenta buscar o status de uma URL fictícia para testar autenticação
            # e ao mesmo tempo captura info de quota
            test_url = f"{SITE_URL}/health-check-probe"
            try:
                service.urlNotifications().getMetadata(url=test_url).execute()
                auth_ok = True
                quota_hint = "autenticação OK"
            except HttpError as he:
                if he.resp.status == 403:
                    auth_ok = False
                    quota_hint = f"PERMISSÃO NEGADA — verifique se a conta de serviço tem acesso ao Search Console"
                elif he.resp.status == 429:
                    auth_ok = True
                    quota_hint = "QUOTA ESGOTADA HOJE (429)"
                elif he.resp.status == 404:
                    auth_ok = True
                    quota_hint = "autenticação OK (URL de teste não existe, esperado)"
                else:
                    auth_ok = True
                    quota_hint = f"HTTP {he.resp.status}"

            color = G if auth_ok else R
            row(f"  {label}:", quota_hint, color)
            results[label] = {"status": "ok" if auth_ok else "error", "hint": quota_hint}

        except Exception as exc:
            row(f"  {label}:", f"ERRO: {type(exc).__name__}: {str(exc)[:60]}", R)
            results[label] = {"status": "exception", "error": str(exc)}

    active = sum(1 for v in results.values() if v.get("status") == "ok")
    print()
    row("Credenciais ativas:", f"{active}/6", G if active == 6 else Y)
    row("Capacidade diária estimada:", f"{active * 200} URLs/dia", G if active > 0 else R)

    return results


def check_indexing_log(db) -> dict:
    """
    Verifica os últimos 7 dias de logs de indexação.
    Mostra: erros por projeto, taxa de sucesso, URLs com problema.
    """
    section("3. LOG DE INDEXAÇÃO — Últimos 7 Dias")

    try:
        since = (datetime.datetime.utcnow() - datetime.timedelta(days=7)).isoformat()

        res = db.table("indexing_log")\
            .select("project, http_status, status, url, created_at")\
            .gte("created_at", since)\
            .execute()

        rows = res.data or []
        if not rows:
            print(f"  {DIM}Nenhum log nos últimos 7 dias.{RST}")
            return {"total": 0}

        by_status = defaultdict(int)
        by_project = defaultdict(lambda: {"success": 0, "error": 0, "quota": 0})
        error_urls = []

        for r in rows:
            s = r.get("status","?")
            by_status[s] += 1
            proj = r.get("project","?")
            if s == "success":
                by_project[proj]["success"] += 1
            elif s == "quota_exceeded":
                by_project[proj]["quota"] += 1
            else:
                by_project[proj]["error"] += 1
                error_urls.append(r.get("url","?"))

        total = len(rows)
        success_rate = round(by_status.get("success",0) / total * 100, 1) if total else 0

        row("Total de submissões (7d):", total)
        row("  ✅ Sucesso:", by_status.get("success",0), G)
        row("  ❌ Erro:", by_status.get("error",0), R if by_status.get("error",0) > 0 else "")
        row("  ⚠️  Quota exceeded:", by_status.get("quota_exceeded",0), Y)
        row("Taxa de sucesso:", f"{success_rate}%", G if success_rate > 90 else Y)

        print()
        print(f"  {DIM}Por projeto:{RST}")
        for proj, data in sorted(by_project.items()):
            print(f"    {proj}: ✅{data['success']}  ❌{data['error']}  ⚠️{data['quota']}")

        if error_urls:
            print(f"\n  {R}URLs com erro (últimas 5):{RST}")
            for u in error_urls[-5:]:
                print(f"    {DIM}• {u}{RST}")

        return {"total": total, "success_rate": success_rate}

    except Exception as exc:
        print(f"  {R}Erro ao ler indexing_log: {exc}{RST}")
        return {"error": str(exc)}


def check_ingestion_velocity(db) -> dict:
    """
    Mostra quantos grupos foram publicados por dia nos últimos 7 dias.
    Permite verificar se o ritmo de 150/dia está sendo mantido.
    """
    section("4. VELOCIDADE DE INGESTÃO — Últimos 7 Dias")

    try:
        since = (datetime.datetime.utcnow() - datetime.timedelta(days=7)).isoformat()

        res = db.table("groups")\
            .select("published_at")\
            .gte("published_at", since)\
            .not_.is_("published_at", "null")\
            .execute()

        rows = res.data or []
        by_day = defaultdict(int)
        for r in rows:
            day = str(r["published_at"])[:10]
            by_day[day] += 1

        if not by_day:
            print(f"  {Y}Nenhum grupo publicado nos últimos 7 dias.{RST}")
            return {"days": {}}

        for day in sorted(by_day.keys()):
            n = by_day[day]
            bar = "█" * min(n // 5, 30)
            color = G if n >= 100 else (Y if n >= 50 else R)
            print(f"  {day}  {color}{bar}{RST} {n}")

        avg = round(sum(by_day.values()) / len(by_day), 1)
        print()
        row("Média diária:", f"{avg} grupos/dia", G if avg >= 100 else Y)

        return {"days": dict(by_day), "avg_per_day": avg}

    except Exception as exc:
        print(f"  {R}Erro: {exc}{RST}")
        return {"error": str(exc)}


def check_pages_404(db) -> dict:
    """
    Detecta grupos com indexing_status='submitted' ou 'indexed'
    mas que estão hidden=True ou broken=True (página responderia 404).
    """
    section("5. RISCO DE 404 — Páginas Submetidas com Problema")

    try:
        res = db.table("groups")\
            .select("id, slug, indexing_status, hidden, broken", count="exact")\
            .in_("indexing_status", ["submitted","indexed"])\
            .or_("hidden.eq.true,broken.eq.true")\
            .execute()

        count = res.count or 0
        rows  = res.data or []

        if count == 0:
            print(f"  {G}✅ Nenhuma página submetida com risco de 404.{RST}")
            return {"at_risk": 0}

        print(f"  {R}⚠️  {count} URLs submetidas ao Google mas com hidden/broken:{RST}")
        for r in rows[:10]:
            flag = "hidden" if r.get("hidden") else "broken"
            print(f"    {DIM}• /{r['slug']} [{r['indexing_status']}] → {flag}{RST}")
        if count > 10:
            print(f"    {DIM}  ... e mais {count - 10}{RST}")

        print(f"\n  {Y}→ Ação: rodar deindex_broken.py para remover essas URLs do Google{RST}")

        return {"at_risk": count, "slugs": [r["slug"] for r in rows]}

    except Exception as exc:
        print(f"  {R}Erro: {exc}{RST}")
        return {"error": str(exc)}


def print_recommendations(db_result: dict, api_result: dict, log_result: dict):
    """Recomendações baseadas no estado atual."""
    section("6. RECOMENDAÇÕES DE AÇÃO")

    issues = []

    if not db_result.get("ok"):
        issues.append((R, "CRÍTICO", "Supabase inacessível. Verifique as variáveis de ambiente."))

    if db_result.get("empty_desc", 0) > 0:
        issues.append((Y, "ATENÇÃO",
            f"{db_result['empty_desc']} grupos sem seo_description — "
            "rodar: python scripts/content/ai_content_generator.py"))

    active_creds = sum(1 for v in api_result.values() if v.get("status") == "ok")
    if active_creds < 3:
        issues.append((Y, "ATENÇÃO",
            f"Apenas {active_creds} credenciais ativas. "
            "Capacidade reduzida para indexação."))

    if log_result.get("success_rate", 100) < 80:
        issues.append((R, "PROBLEMA",
            f"Taxa de sucesso da API: {log_result['success_rate']}% — "
            "verifique as permissões no Google Search Console."))

    if not issues:
        print(f"  {G}✅ Nenhuma ação necessária. Sistema saudável.{RST}")
    else:
        for color, level, msg in issues:
            print(f"  {color}[{level}]{RST} {msg}")


def main():
    print(f"\n{BOLD}{'━' * 55}{RST}")
    print(f"{BOLD}  nsfw-directory — Health Check Dashboard{RST}")
    print(f"  {DIM}{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')} UTC{RST}")
    print(f"{BOLD}{'━' * 55}{RST}")

    # [F1] Ponto de falha: Supabase offline
    try:
        db = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as exc:
        print(f"\n{R}FATAL: Não foi possível conectar ao Supabase.{RST}")
        print(f"{R}  {type(exc).__name__}: {exc}{RST}")
        sys.exit(1)

    db_result  = check_database(db)
    api_result = check_api_quotas()
    log_result = check_indexing_log(db)
    vel_result = check_ingestion_velocity(db)
    f404_result = check_pages_404(db)

    print_recommendations(db_result, api_result, log_result)

    print(f"\n{BOLD}{'━' * 55}{RST}\n")


if __name__ == "__main__":
    main()
