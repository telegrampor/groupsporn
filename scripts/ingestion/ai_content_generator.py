"""
ai_content_generator.py — Gera seo_description via claude-haiku com anti-falhas.

Processa grupos sem seo_description em batches de 20.
Cada descrição gerada é: verificada, salva, e confirmada no banco antes de avançar.

3 Principais pontos de falha:

  [F1] Anthropic API timeout ou rate limit
       → Proteção: retry com backoff exponencial (3 tentativas).
         Se falhar nas 3, loga o grupo_id e slug, e pula — não trava o batch inteiro.

  [F2] Resposta da IA vazia ou muito curta (<60 chars)
       → Proteção: validação de tamanho antes de salvar.
         Se inválida, retenta com prompt diferente. Se falhar de novo, mantém draft.

  [F3] UPDATE no banco falha silenciosamente (retorna success mas não salva)
       → Proteção: SELECT de confirmação após cada UPDATE.
         Se o campo continuar nulo, loga como falha e não marca como 'queued'.
"""

import os
import sys
import time
import datetime
from pathlib import Path

import anthropic
from dotenv import load_dotenv
from supabase import create_client

sys.path.insert(0, str(Path(__file__).parent.parent))
from utils.logger import Logger
from utils.db_validator import DBValidator

load_dotenv()

SUPABASE_URL  = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
SUPABASE_KEY  = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
ANTHROPIC_KEY = os.environ["ANTHROPIC_API_KEY"]
SITE_NAME     = os.environ.get("NEXT_PUBLIC_SITE_NAME", "TeleNSFW")

BATCH_SIZE    = 20      # grupos por execução
MIN_DESC_LEN  = 80      # mínimo de chars para seo_description ser válida
MAX_DESC_LEN  = 160     # máximo recomendado para meta description
MAX_RETRIES   = 3
RETRY_DELAY_S = 2.0
RATE_LIMIT_S  = 0.8     # delay entre chamadas à API Anthropic


def build_prompt(name: str, description: str, category: str,
                 country: str, member_count: int) -> str:
    """
    Prompt para gerar seo_description única por grupo.
    Fórmula: ação + keyword + contexto + benefício (max 160 chars)
    """
    ctx_parts = []
    if description:
        ctx_parts.append(f"Original description: {description[:200]}")
    if member_count > 0:
        ctx_parts.append(f"Members: {member_count:,}")
    if country and country != "All":
        ctx_parts.append(f"Country: {country}")
    context = " | ".join(ctx_parts) if ctx_parts else "No additional context."

    return f"""Write a concise SEO meta description for a Telegram group directory page.

Group name: {name}
Category: {category}
{context}

Requirements:
- Length: between {MIN_DESC_LEN} and {MAX_DESC_LEN} characters (this is a hard limit)
- Language: English
- Include the group name naturally
- Include a call-to-action like "Join", "Discover", or "Explore"
- Mention the category or content type
- Do NOT use quotes, markdown, or emojis
- Do NOT start with "This group" or "Welcome to"
- Make it unique and descriptive, not generic

Return ONLY the description text, nothing else."""


def call_claude(
    client: anthropic.Anthropic,
    prompt: str,
    group_slug: str,
    log: Logger,
    attempt: int = 1
) -> str | None:
    """
    [F1] Chama a API com retry e backoff exponencial.
    Retorna o texto ou None se todas as tentativas falharem.
    """
    try:
        t0 = time.time()
        message = client.messages.create(
            model="claude-haiku-4-5",
            max_tokens=200,
            messages=[{"role": "user", "content": prompt}],
        )
        elapsed = time.time() - t0
        raw = (message.content[0].text or "").strip()

        log.info(
            f"Anthropic API respondeu",
            slug=group_slug,
            attempt=attempt,
            elapsed_ms=round(elapsed * 1000),
            response_len=len(raw),
            input_tokens=message.usage.input_tokens,
            output_tokens=message.usage.output_tokens,
        )
        return raw

    except anthropic.RateLimitError as exc:
        wait = RETRY_DELAY_S * (2 ** attempt)
        log.warning(
            f"Rate limit Anthropic — aguardando {wait}s antes de retry",
            slug=group_slug,
            attempt=attempt,
            max_retries=MAX_RETRIES,
            wait_sec=wait,
        )
        if attempt < MAX_RETRIES:
            time.sleep(wait)
            return call_claude(client, prompt, group_slug, log, attempt + 1)
        log.error(
            f"Rate limit após {MAX_RETRIES} tentativas — pulando grupo",
            slug=group_slug
        )
        return None

    except anthropic.APITimeoutError as exc:
        wait = RETRY_DELAY_S * attempt
        log.warning(
            f"Timeout Anthropic (tentativa {attempt}/{MAX_RETRIES})",
            slug=group_slug,
            wait_sec=wait,
        )
        if attempt < MAX_RETRIES:
            time.sleep(wait)
            return call_claude(client, prompt, group_slug, log, attempt + 1)
        log.error(f"Timeout após {MAX_RETRIES} tentativas", slug=group_slug)
        return None

    except Exception as exc:
        log.error(
            f"Exceção inesperada ao chamar Anthropic API",
            exc=exc,
            slug=group_slug,
            attempt=attempt,
        )
        return None


def validate_description(raw: str, group_name: str, log: Logger) -> str | None:
    """
    [F2] Valida e limpa a descrição antes de salvar.
    Retorna texto limpo ou None se inválido.
    """
    if not raw:
        return None

    # Remove aspas e markdown que a IA às vezes adiciona
    cleaned = raw.strip('"\'`').strip()

    # Remove prefixos indesejados comuns
    for prefix in ["Description:", "SEO:", "Meta description:"]:
        if cleaned.lower().startswith(prefix.lower()):
            cleaned = cleaned[len(prefix):].strip()

    if len(cleaned) < MIN_DESC_LEN:
        log.warning(
            f"Descrição muito curta: {len(cleaned)} chars (mínimo {MIN_DESC_LEN})",
            preview=cleaned[:100],
            group=group_name,
        )
        return None

    if len(cleaned) > MAX_DESC_LEN:
        # Trunca na última frase completa antes do limite
        truncated = cleaned[:MAX_DESC_LEN].rsplit(".", 1)[0] + "."
        log.warning(
            f"Descrição truncada: {len(cleaned)} → {len(truncated)} chars",
            group=group_name,
        )
        cleaned = truncated

    # Verifica se contém o nome do grupo (relevância SEO)
    if group_name.lower() not in cleaned.lower():
        log.warning(
            f"Descrição não menciona o nome do grupo — pode ser genérica",
            group=group_name,
            preview=cleaned[:100],
        )
        # Não rejeita, mas avisa

    return cleaned


def process_group(
    group: dict,
    client: anthropic.Anthropic,
    db,
    validator: DBValidator,
    log: Logger,
) -> bool:
    """
    Processa um grupo: gera, valida, salva, confirma.
    Retorna True se sucesso completo com confirmação no banco.
    """
    gid   = group["id"]
    slug  = group["slug"]
    name  = group["name"]

    log.info(f"Processando: {slug}", id=gid, name=name)

    # Gera descrição
    prompt = build_prompt(
        name=name,
        description=group.get("description") or "",
        category=group.get("category_slug") or "telegram",
        country=group.get("country") or "All",
        member_count=group.get("member_count") or 0,
    )

    raw = call_claude(client, prompt, slug, log)
    if raw is None:
        log.error(
            f"Falha na geração — grupo mantido em draft",
            slug=slug, id=gid
        )
        return False

    # Valida
    description = validate_description(raw, name, log)
    if description is None:
        # Segunda tentativa com prompt mais simples
        log.info(f"Segunda tentativa com prompt simplificado", slug=slug)
        simple_prompt = (
            f"Write a {MIN_DESC_LEN}-{MAX_DESC_LEN} character SEO description "
            f"for a Telegram group called '{name}' in the {group.get('category_slug','adult')} "
            f"category. Include a call to action. Return only the text."
        )
        raw2 = call_claude(client, simple_prompt, slug, log, attempt=1)
        description = validate_description(raw2 or "", name, log)

        if description is None:
            log.error(
                f"Segunda tentativa também inválida — mantendo draft",
                slug=slug, id=gid
            )
            return False

    # Salva no banco
    try:
        update_res = db.table("groups").update({
            "seo_description": description,
            "updated_at": datetime.datetime.utcnow().isoformat() + "Z",
        }).eq("id", gid).execute()

        if not update_res.data:
            log.warning(
                "UPDATE retornou vazio — verificando banco",
                slug=slug, id=gid
            )

    except Exception as exc:
        log.error(
            "FALHA ao salvar seo_description no banco",
            exc=exc,
            slug=slug, id=gid
        )
        return False

    # [F3] Cross-check: confirma que foi salvo
    confirmed = validator.verify_seo_description(gid, min_length=MIN_DESC_LEN)
    if not confirmed:
        log.error(
            "Cross-check falhou: seo_description não está no banco após UPDATE",
            slug=slug, id=gid,
            attempted_text=description[:100]
        )
        return False

    # Atualiza quality_score (trigger SQL faz isso automaticamente,
    # mas forçamos updated_at para o trigger disparar)
    try:
        db.table("groups").update({
            "updated_at": datetime.datetime.utcnow().isoformat() + "Z",
        }).eq("id", gid).execute()
    except Exception:
        pass  # Não crítico

    log.success(
        f"seo_description salva e confirmada no banco",
        slug=slug,
        id=gid,
        description_len=len(description),
        preview=description[:80] + "…",
    )
    return True


def main():
    log = Logger("ai_content_generator")
    db  = create_client(SUPABASE_URL, SUPABASE_KEY)
    validator = DBValidator(db, log)
    client    = anthropic.Anthropic(api_key=ANTHROPIC_KEY)

    log.separator("BUSCANDO GRUPOS SEM seo_description")

    # Busca grupos que precisam de descrição
    # Prioridade: queued > published > draft, por quality_score DESC
    res = db.table("groups")\
        .select("id, slug, name, description, category_slug, country, member_count, indexing_status")\
        .is_("seo_description", "null")\
        .not_.in_("indexing_status", ["broken","deindexed"])\
        .eq("hidden", False)\
        .order("quality_score", desc=True)\
        .limit(BATCH_SIZE)\
        .execute()

    groups = res.data or []
    if not groups:
        log.info("Nenhum grupo sem seo_description encontrado. Nada a fazer.")
        log.finalize()
        return

    log.info(
        f"Encontrados {len(groups)} grupos sem seo_description",
        sample=str([g["slug"] for g in groups[:5]])
    )

    log.separator(f"PROCESSANDO {len(groups)} GRUPOS")

    success_count = 0
    fail_count    = 0
    cost_estimate = 0.0  # estimativa em USD

    for i, group in enumerate(groups):
        log.separator(f"Grupo {i+1}/{len(groups)}: {group['slug']}")

        ok = process_group(group, client, db, validator, log)
        if ok:
            success_count += 1
            cost_estimate += 0.002  # ~$0.002 por grupo com Haiku
        else:
            fail_count += 1

        # Rate limit
        if i < len(groups) - 1:
            time.sleep(RATE_LIMIT_S)

    log.separator("RELATÓRIO FINAL")
    log.info(
        "Geração concluída",
        successes=success_count,
        failures=fail_count,
        total=len(groups),
        success_rate=f"{round(success_count/len(groups)*100,1)}%",
        estimated_cost_usd=round(cost_estimate, 4),
    )

    if fail_count > 0:
        log.warning(
            f"{fail_count} grupos não receberam seo_description",
            action="re-rodar este script amanhã para processar os que falharam"
        )

    log.finalize()


if __name__ == "__main__":
    main()
