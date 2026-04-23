"""
erogram_scraper.py v4
Coleta grupos do erogram.pro e insere/atualiza no Supabase.

Fase 1 — Listing: scrape da listagem paginada (batch upsert)
Fase 2 — Enrich:  visita cada página individual para coletar
                   telegram_url e description nos grupos com telegram_url IS NULL

Uso:
  python scripts/scraper/erogram_scraper.py                  # fases 1 + 2
  python scripts/scraper/erogram_scraper.py --enrich-only    # só fase 2
  python scripts/scraper/erogram_scraper.py --target 500 --enrich-limit 300
"""

import argparse
import os
import re
import time
from urllib.parse import unquote

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
BASE_URL     = "https://erogram.pro"
HEADERS      = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}

# ─────────────────────────────────────────
# DB
# ─────────────────────────────────────────

def get_db():
    return create_client(SUPABASE_URL, SUPABASE_KEY)


# ─────────────────────────────────────────
# FASE 1 — LISTING SCRAPE
# ─────────────────────────────────────────

def scrape_listing_page(page: int) -> list[dict]:
    """Coleta cards de grupo da listagem paginada do erogram."""
    url = f"{BASE_URL}/groups/page/{page}" if page > 1 else f"{BASE_URL}/groups"
    try:
        r = requests.get(url, headers=HEADERS, timeout=20)
    except Exception as e:
        print(f"  Erro HTTP página {page}: {e}")
        return []

    if r.status_code != 200:
        print(f"  Página {page} retornou {r.status_code}")
        return []

    soup   = BeautifulSoup(r.text, "html.parser")
    groups = []
    seen   = set()

    for card in soup.select("a[href^='/']"):
        href = card.get("href", "")
        if not href or href.count("/") != 1:
            continue
        if any(href.startswith(p) for p in [
            "/groups", "/bots", "/articles", "/ainsfw", "/onlyfans",
            "/add", "/login", "/best", "/premium", "/advertise",
            "/contact", "/de/", "/es/", "/page", "/premiumvault",
            "/ofsearch",
        ]):
            continue

        slug = href.strip("/")
        if not slug or slug in seen or len(slug) < 2:
            continue
        seen.add(slug)

        name_el = card.select_one("h3, h2")
        name    = name_el.get_text(strip=True) if name_el else slug.replace("-", " ").title()
        if not name or len(name) < 2:
            name = slug.replace("-", " ").title()
        name = name.replace("'", "''")

        img   = card.select_one("img")
        thumb = img.get("src", "") if img else ""
        if thumb.startswith("/_next/image"):
            m = re.search(r"url=([^&]+)", thumb)
            if m:
                thumb = unquote(m.group(1))
        thumb = thumb.replace("'", "''") if thumb else ""

        cat_el   = card.select_one("span")
        cat_text = cat_el.get_text(strip=True).lower() if cat_el else ""
        category = _map_category(cat_text)

        members = 0
        for el in card.select("span, p"):
            t = el.get_text(strip=True).replace(",", "").replace(".", "")
            if "K" in t:
                try:
                    members = int(float(t.replace("K", "")) * 1_000)
                    break
                except ValueError:
                    pass
            elif t.isdigit() and int(t) > 100:
                members = int(t)
                break

        groups.append({
            "slug":     slug,
            "name":     name,
            "thumb":    thumb,
            "category": category,
            "members":  members,
        })

    return groups


def _map_category(text: str) -> str:
    mapping = [
        ("milf",      "milf"),
        ("amateur",   "amateur"),
        ("lesbian",   "lesbian"),
        ("anal",      "anal"),
        ("asian",     "asian"),
        ("anime",     "anime"),
        ("hentai",    "anime"),
        ("bdsm",      "bdsm"),
        ("onlyfan",   "onlyfans"),
        ("teen",      "teen-18-plus"),
        ("fetish",    "fetish"),
        ("cosplay",   "cosplay"),
        ("trans",     "trans"),
        ("ebony",     "ebony"),
        ("latina",    "latina"),
        ("big ass",   "big-ass"),
        ("big tits",  "big-tits"),
        ("threesome", "threesome"),
        ("creampie",  "creampie"),
        ("gay",       "gay"),
        ("japan",     "japan"),
        ("german",    "germany"),
        ("russia",    "russia"),
        ("nsfw",      "nsfw-telegram"),
        ("porn",      "telegram-porn"),
    ]
    for key, slug in mapping:
        if key in text:
            return slug
    return "telegram-porn"


def insert_batch(groups: list[dict]) -> int:
    """Upsert em batch; fallback individual se falhar."""
    if not groups:
        return 0

    db = get_db()
    records = [
        {
            "slug":            g["slug"],
            "name":            g["name"],
            "thumbnail_url":   g["thumb"] or None,
            "category_slug":   g["category"],
            "member_count":    g["members"],
            "indexing_status": "queued",
            "status":          "active",
            "is_new":          True,
            "is_verified":     True,
            "source":          "erogram",
        }
        for g in groups
    ]

    try:
        res = db.table("groups").upsert(
            records,
            on_conflict="slug",
            ignore_duplicates=True,
        ).execute()
        return len(res.data) if res.data else 0
    except Exception as e:
        print(f"  ❌ Erro no batch insert: {e}")
        inserted = 0
        for rec in records:
            time.sleep(1.0)
            try:
                db2 = get_db()
                ex  = db2.table("groups").select("id").eq("slug", rec["slug"]).execute()
                if ex.data:
                    continue
                db2.table("groups").insert(rec).execute()
                inserted += 1
                print(f"    ✅ {rec['slug']}")
            except Exception as e2:
                print(f"    ❌ {rec['slug']}: {e2}")
        return inserted


# ─────────────────────────────────────────
# FASE 2 — DETAIL SCRAPE (telegram_url + description)
# ─────────────────────────────────────────

def scrape_group_page(slug: str) -> dict:
    """
    Visita https://erogram.pro/{slug} e extrai:
      - telegram_url : href do botão que contém t.me/
      - description  : texto descritivo do grupo
    """
    url    = f"{BASE_URL}/{slug}"
    result = {"telegram_url": None, "description": None}

    try:
        r = requests.get(url, headers=HEADERS, timeout=20)
    except Exception as e:
        print(f"    Erro HTTP {slug}: {e}")
        return result

    if r.status_code != 200:
        print(f"    {slug}: HTTP {r.status_code}")
        return result

    soup = BeautifulSoup(r.text, "html.parser")

    # ── telegram_url ──────────────────────
    # Prioridade: âncora explícita com t.me/
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if "t.me/" in href and href.startswith("https://t.me/"):
            result["telegram_url"] = href
            break

    # Fallback: botão com classe join/cta
    if not result["telegram_url"]:
        for sel in [
            'a[href*="t.me/"]',
            'a[class*="join" i]',
            'a[class*="Join"]',
            'a[class*="btn" i][href*="t.me"]',
        ]:
            el = soup.select_one(sel)
            if el and "t.me/" in el.get("href", ""):
                result["telegram_url"] = el["href"]
                break

    # ── description ───────────────────────
    # Tentativas em ordem de especificidade
    desc_selectors = [
        'meta[name="description"]',         # meta tag
        ".group-description",
        ".description",
        'p[class*="desc" i]',
        'div[class*="desc" i] > p',
        "article p",
        "section p",
        ".content p",
        "main p",
    ]
    for sel in desc_selectors:
        el = soup.select_one(sel)
        if not el:
            continue
        if el.name == "meta":
            text = el.get("content", "").strip()
        else:
            text = el.get_text(strip=True)

        # Ignora textos muito curtos ou de navegação
        if len(text) < 30:
            continue
        # Descarta se começar com copyright / marcas do site
        low = text.lower()
        if any(kw in low[:40] for kw in ["erogram", "copyright", "©", "cookie", "privacy"]):
            continue

        result["description"] = text[:600]
        break

    return result


def enrich_groups(limit: int = 200) -> int:
    """
    Busca grupos no banco com telegram_url IS NULL (source = 'erogram')
    e visita a página individual para preenchê-los.
    """
    db = get_db()

    print(f"\n{'─'*50}")
    print(f"  Fase 2 — Enriquecimento (telegram_url IS NULL)")
    print(f"{'─'*50}")

    try:
        res = (
            db.table("groups")
            .select("id, slug")
            .is_("telegram_url", "null")
            .eq("source", "erogram")
            .limit(limit)
            .execute()
        )
        rows = res.data or []
    except Exception as e:
        print(f"  ❌ Erro ao buscar grupos: {e}")
        return 0

    if not rows:
        print("  ✓ Nenhum grupo com telegram_url NULL — nada a fazer.")
        return 0

    print(f"  Encontrados {len(rows)} grupos para enriquecer.\n")
    updated = 0
    errors  = 0

    for i, row in enumerate(rows, 1):
        slug = row["slug"]
        print(f"  [{i}/{len(rows)}] {slug}", end=" → ", flush=True)

        time.sleep(1.5)  # delay obrigatório entre requisições

        detail = scrape_group_page(slug)

        if not detail["telegram_url"] and not detail["description"]:
            print("⚠️  sem dados")
            errors += 1
            continue

        update_payload: dict = {}
        if detail["telegram_url"]:
            update_payload["telegram_url"] = detail["telegram_url"]
        if detail["description"]:
            # Limpa aspas simples para segurança no banco
            update_payload["description"] = detail["description"].replace("'", "\\'")

        try:
            db2 = get_db()
            db2.table("groups").update(update_payload).eq("slug", slug).execute()
            updated += 1
            tg_short = (detail["telegram_url"] or "—")[:55]
            print(f"✅ {tg_short}")
        except Exception as e:
            print(f"❌ DB error: {e}")
            errors += 1

    print(f"\n  Enriquecimento concluído — ✅ {updated} atualizados | ❌ {errors} erros")
    return updated


# ─────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Erogram scraper v4")
    parser.add_argument(
        "--enrich-only", action="store_true",
        help="Pula o scrape de listagem e executa apenas o enriquecimento (fase 2)",
    )
    parser.add_argument(
        "--target", type=int, default=250,
        help="Número alvo de grupos para coletar na listagem (padrão: 250)",
    )
    parser.add_argument(
        "--enrich-limit", type=int, default=200,
        help="Máximo de grupos a enriquecer na fase 2 (padrão: 200)",
    )
    args = parser.parse_args()

    print(f"\n{'='*54}")
    print(f"  Erogram Scraper v4")
    print(f"{'='*54}")

    # ── FASE 1: listing ───────────────────
    if not args.enrich_only:
        print(f"\n  Fase 1 — Listagem (alvo: {args.target} grupos)")
        print(f"{'─'*54}")

        total = 0
        for page in range(1, 30):
            if total >= args.target:
                break

            print(f"\n📄 Página {page}...")
            groups = scrape_listing_page(page)

            if not groups:
                print(f"  Página {page} vazia — parando listagem.")
                break

            print(f"  {len(groups)} grupos, inserindo em batch...")
            inserted = insert_batch(groups)
            total   += inserted
            print(f"  ✅ Novos: {inserted} | Acumulado: {total}")

            time.sleep(3)

        print(f"\n  Fase 1 concluída — {total} grupos inseridos/atualizados")

    # ── FASE 2: enriquecimento ────────────
    enrich_groups(limit=args.enrich_limit)

    print(f"\n{'='*54}")
    print(f"  CONCLUÍDO")
    print(f"{'='*54}\n")


if __name__ == "__main__":
    main()
