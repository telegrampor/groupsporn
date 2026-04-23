"""
erogram_scraper.py v3
Coleta grupos do erogram.pro e insere via SQL batch no Supabase.
Evita ConnectionTerminated fazendo um único INSERT por página.
"""

import os, time, re, requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
BASE_URL     = "https://erogram.pro"
HEADERS      = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}


def get_db():
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def scrape_page(page: int) -> list[dict]:
    url = f"{BASE_URL}/groups/page/{page}" if page > 1 else f"{BASE_URL}/groups"
    try:
        r = requests.get(url, headers=HEADERS, timeout=20)
    except Exception as e:
        print(f"  Erro HTTP página {page}: {e}")
        return []

    if r.status_code != 200:
        print(f"  Página {page} retornou {r.status_code}")
        return []

    soup  = BeautifulSoup(r.text, "html.parser")
    groups = []
    seen   = set()

    for card in soup.select("a[href^='/']"):
        href = card.get("href", "")
        if not href or href.count("/") != 1:
            continue
        if any(href.startswith(p) for p in [
            "/groups", "/bots", "/articles", "/ainsfw", "/onlyfans",
            "/add", "/login", "/best", "/premium", "/advertise",
            "/contact", "/de/", "/es/", "/page", "/premiumvault"
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
        # Limpa aspas para não quebrar o SQL
        name = name.replace("'", "''")

        img   = card.select_one("img")
        thumb = img.get("src", "") if img else ""
        if thumb.startswith("/_next/image"):
            match = re.search(r"url=([^&]+)", thumb)
            if match:
                from urllib.parse import unquote
                thumb = unquote(match.group(1))
        thumb = thumb.replace("'", "''") if thumb else ""

        cat_el   = card.select_one("span")
        cat_text = cat_el.get_text(strip=True).lower() if cat_el else ""
        category = map_category(cat_text)

        members = 0
        for el in card.select("span, p"):
            t = el.get_text(strip=True).replace(",", "").replace(".", "")
            if "K" in t:
                try:
                    members = int(float(t.replace("K", "")) * 1000)
                    break
                except:
                    pass
            elif t.isdigit() and int(t) > 100:
                members = int(t)
                break

        groups.append({
            "slug":         slug,
            "name":         name,
            "thumb":        thumb,
            "category":     category,
            "members":      members,
        })

    return groups


def map_category(text: str) -> str:
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
    """Insere todos os grupos da página em um único upsert."""
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
            ignore_duplicates=True
        ).execute()
        inserted = len(res.data) if res.data else 0
        return inserted
    except Exception as e:
        print(f"  ❌ Erro no batch insert: {e}")
        # Fallback: tenta um a um com delay maior
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
                print(f"  ✅ {rec['slug']}")
            except Exception as e2:
                print(f"  ❌ {rec['slug']}: {e2}")
        return inserted


def main():
    total = 0
    TARGET = 250

    print(f"\n{'='*50}")
    print(f"  Erogram Scraper v3 — alvo: {TARGET} grupos")
    print(f"{'='*50}\n")

    for page in range(1, 20):
        if total >= TARGET:
            break

        print(f"\n📄 Página {page}...")
        groups = scrape_page(page)

        if not groups:
            print(f"  Página {page} vazia — parando.")
            break

        print(f"  {len(groups)} grupos coletados, inserindo em batch...")
        inserted = insert_batch(groups)
        total   += inserted
        print(f"  ✅ Inseridos: {inserted} | Total acumulado: {total}")

        time.sleep(3)

    print(f"\n{'='*50}")
    print(f"  CONCLUÍDO — {total} grupos inseridos no banco")
    print(f"{'='*50}\n")


if __name__ == "__main__":
    main()
