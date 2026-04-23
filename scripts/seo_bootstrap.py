"""
seo_bootstrap.py
================
Bootstrap SEO 100% baseado em arquivos exportados.
Não precisa de nenhuma API key — só dos arquivos que você baixa manualmente.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ARQUIVOS QUE VOCÊ PRECISA EXPORTAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. SEMRUSH — erogram.pro → Organic Research
   Caminho no Semrush:
     Competitive Research → Organic Research → digite erogram.pro
     → aba "Positions" → Export → .xlsx ou .csv
   Salvar em: data/semrush/organic_research.xlsx

2. SEMRUSH — erogram.pro → Top Pages
   Caminho no Semrush:
     Competitive Research → Organic Research → erogram.pro
     → aba "Pages" → Export
   Salvar em: data/semrush/top_pages.xlsx

3. SIMILARWEB — erogram.pro → Overview
   Caminho: similarweb.com → erogram.pro → botão Export (no topo da página)
   Salvar em: data/similarweb/overview.xlsx

4. SIMILARWEB — erogram.pro → Geography
   Caminho: similarweb.com → erogram.pro → seção Geography → Export
   Salvar em: data/similarweb/geography.xlsx

Obs: os nomes dos arquivos não importam.
     O script detecta o conteúdo automaticamente.
     Pode colocar quantos arquivos quiser em cada pasta.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMO RODAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  cd C:\\nsfw-directory
  python scripts/seo_bootstrap.py

O que acontece:
  1. Lê todos os arquivos das pastas data/semrush/ e data/similarweb/
  2. Detecta automaticamente o tipo de cada arquivo
  3. Classifica as keywords por categoria
  4. Atualiza o banco:
     - categories (is_trending + sort_order por potencial real)
     - top_lists  (/best-telegram-groups/[slug] com SEO titles otimizados)
     - seo_config (ranking salvo para outros scripts usarem)
  5. Imprime a lista de categorias ordenadas por potencial
     → Use isso para escolher os 50 grupos do sandbox
"""

import os
import sys
import datetime
from pathlib import Path
from collections import defaultdict

from dotenv import load_dotenv
from supabase import create_client

try:
    import pandas as pd
    PANDAS_OK = True
except ImportError:
    PANDAS_OK = False

sys.path.insert(0, str(Path(__file__).parent))
from utils.logger import Logger

load_dotenv()

SUPABASE_URL = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
SITE_NAME    = os.environ.get("NEXT_PUBLIC_SITE_NAME", "TeleNSFW")

SEMRUSH_DIR  = Path("data/semrush")
SW_DIR       = Path("data/similarweb")

# Mapeamento keyword → categoria
# Primeiro match vence — mais específico primeiro
CATEGORY_MAP = [
    ("telegram-porn",    ["telegram porn","porn telegram","xxx telegram","porn channel telegram"]),
    ("nsfw-telegram",    ["nsfw telegram","adult telegram","18+ telegram","nsfw channel"]),
    ("onlyfans",         ["onlyfans telegram","onlyfans group","onlyfans leak","of telegram","onlyfans channel"]),
    ("milf",             ["milf telegram","milf group","milf channel","milf porn telegram"]),
    ("amateur",          ["amateur telegram","amateur porn telegram","homemade telegram"]),
    ("lesbian",          ["lesbian telegram","lesbian group","lesbian porn telegram"]),
    ("anal",             ["anal telegram","anal porn telegram","anal group"]),
    ("asian",            ["asian telegram","asian porn telegram","asian group"]),
    ("anime",            ["anime telegram","hentai telegram","hentai group","anime porn"]),
    ("bdsm",             ["bdsm telegram","bdsm group","bondage telegram","bondage group"]),
    ("big-ass",          ["big ass telegram","booty telegram","pawg telegram"]),
    ("big-tits",         ["big tits telegram","busty telegram","big boobs telegram"]),
    ("latina",           ["latina telegram","latina porn telegram"]),
    ("threesome",        ["threesome telegram","ffm telegram","mmf telegram"]),
    ("teen-18-plus",     ["teen 18 telegram","18+ group","18+ channel"]),
    ("trans",            ["trans telegram","transgender telegram","tgirl telegram"]),
    ("fetish",           ["fetish telegram","feet telegram","foot telegram","kink telegram"]),
    ("ebony",            ["ebony telegram","black porn telegram"]),
    ("cosplay",          ["cosplay telegram","cosplay porn telegram"]),
    ("roleplay",         ["roleplay telegram","rp telegram","erp telegram"]),
    ("gay",              ["gay telegram","gay porn telegram","gay channel telegram"]),
    ("creampie",         ["creampie telegram"]),
    ("blonde",           ["blonde telegram","blonde porn telegram"]),
    ("petite",           ["petite telegram","petite porn telegram"]),
    ("public",           ["public porn telegram","exhibitionist telegram"]),
    ("masturbation",     ["masturbation telegram","solo telegram"]),
    ("vintage",          ["vintage porn telegram","retro porn telegram"]),
    # Países
    ("germany",          ["german telegram","germany telegram","deutsch telegram","german porn"]),
    ("uk",               ["british telegram","uk telegram","english porn telegram","uk porn"]),
    ("usa",              ["american telegram","usa telegram","us porn","american porn"]),
    ("france",           ["french telegram","france telegram","french porn"]),
    ("spain",            ["spanish telegram","spain telegram","spanish porn"]),
    ("italy",            ["italian telegram","italy telegram"]),
    ("russia",           ["russian telegram","russia telegram","russian porn"]),
    ("brazil",           ["brazilian telegram","brasil telegram","brazil porn"]),
    ("japan",            ["japanese telegram","japan telegram","japanese porn"]),
    ("india",            ["indian telegram","desi telegram","indian porn"]),
    ("colombia",         ["colombian telegram","colombia telegram"]),
    ("philippines",      ["filipina telegram","philippines telegram"]),
]

COUNTRY_SLUGS = {
    "germany","uk","usa","france","spain","italy","russia",
    "brazil","japan","india","colombia","philippines","ukraine",
    "vietnam","argentina","mexico","china","korea",
}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# LEITURA DE ARQUIVOS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def _ensure_dirs():
    for d in [SEMRUSH_DIR, SW_DIR]:
        d.mkdir(parents=True, exist_ok=True)


def _read_file(fpath: Path, log: Logger):
    """
    Lê .xlsx ou .csv e retorna DataFrame limpo.
    SimilarWeb e Semrush costumam ter linhas de cabeçalho extras no topo
    — o script localiza automaticamente onde começam os dados reais.
    """
    if not PANDAS_OK:
        log.error("pandas não instalado",
                  action="pip install pandas openpyxl")
        return None

    ext = fpath.suffix.lower()
    try:
        if ext == ".xlsx":
            xl   = pd.ExcelFile(fpath)
            for sheet in xl.sheet_names:
                df_raw = xl.parse(sheet, header=None)
                hr     = _find_header_row(df_raw)
                df     = xl.parse(sheet, header=hr)
                df.columns = [str(c).strip() for c in df.columns]
                df     = df.dropna(how="all").reset_index(drop=True)
                if not df.empty:
                    log.info(f"Lido: {fpath.name}",
                             sheet=sheet, rows=len(df), cols=len(df.columns))
                    return df

        elif ext == ".csv":
            for enc in ["utf-8", "utf-8-sig", "latin-1"]:
                try:
                    df = pd.read_csv(fpath, encoding=enc)
                    df.columns = [str(c).strip() for c in df.columns]
                    df = df.dropna(how="all").reset_index(drop=True)
                    log.info(f"Lido: {fpath.name}",
                             encoding=enc, rows=len(df))
                    return df
                except UnicodeDecodeError:
                    continue

    except Exception as exc:
        log.error(f"Falha ao ler {fpath.name}", exc=exc,
                  action="verifique se o arquivo não está aberto no Excel")
    return None


def _find_header_row(df_raw) -> int:
    """
    Localiza a linha do header real.
    Semrush e SimilarWeb colocam logo/título antes dos dados.
    """
    KEYWORDS = ["keyword","volume","position","url","country",
                "visits","share","traffic","page","phrase","search"]
    for i, row in df_raw.iterrows():
        vals = " ".join(str(v).lower() for v in row if str(v) != "nan")
        if any(k in vals for k in KEYWORDS):
            return i
    return 0


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SEMRUSH — leitura dos exports
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def read_semrush(log: Logger) -> list[dict]:
    """
    Lê todos os arquivos em data/semrush/.
    Detecta automaticamente se é Organic Research ou Top Pages.
    Retorna lista unificada de keywords com volume e posição.

    Colunas esperadas do export Semrush Organic Research:
      Keyword | Position | Search Volume | CPC | URL | Traffic | Traffic (%)
    Colunas esperadas do export Semrush Top Pages:
      URL | Traffic | Traffic (%) | Keywords
    """
    all_keywords = []
    files = list(SEMRUSH_DIR.glob("*.xlsx")) + list(SEMRUSH_DIR.glob("*.csv"))

    if not files:
        log.warning(
            "Nenhum arquivo Semrush encontrado",
            pasta=str(SEMRUSH_DIR.resolve()),
            instrucao_1="Semrush → Competitive Research → Organic Research",
            instrucao_2="Digite erogram.pro → aba Positions → Export",
            instrucao_3=f"Salvar em: {SEMRUSH_DIR.resolve()}",
        )
        return []

    log.info(f"Arquivos Semrush encontrados",
             count=len(files), files=str([f.name for f in files]))

    for fpath in files:
        df = _read_file(fpath, log)
        if df is None or df.empty:
            continue

        cols = {str(c).lower().strip(): c for c in df.columns}

        # Detecta tipo pelo conteúdo das colunas
        # Organic Research: tem "keyword" ou "phrase"
        kw_col = None
        for candidate in ["keyword","phrase","search query","query"]:
            if candidate in cols:
                kw_col = cols[candidate]
                break

        if kw_col is None:
            log.warning(f"Arquivo sem coluna de keyword: {fpath.name}",
                        colunas=str(list(cols.keys())[:8]),
                        action="verifique se exportou Organic Research ou Keyword Overview")
            continue

        # Coluna de volume
        vol_col = None
        for candidate in ["search volume","volume","monthly searches","avg. monthly searches"]:
            if candidate in cols:
                vol_col = cols[candidate]
                break

        # Coluna de posição
        pos_col = None
        for candidate in ["position","pos.","rank","ranking position"]:
            if candidate in cols:
                pos_col = cols[candidate]
                break

        # Coluna de CPC
        cpc_col = None
        for candidate in ["cpc","cost per click","cpc (usd)"]:
            if candidate in cols:
                cpc_col = cols[candidate]
                break

        parsed = 0
        for _, row in df.iterrows():
            kw = str(row.get(kw_col,"")).strip().lower()
            if not kw or kw == "nan":
                continue

            vol = 0
            if vol_col:
                try:
                    vol = int(str(row[vol_col]).replace(",","").replace(".","") or 0)
                except: vol = 0

            pos = 0
            if pos_col:
                try: pos = int(float(str(row[pos_col]).replace(",",".") or 0))
                except: pos = 0

            cpc = 0.0
            if cpc_col:
                try: cpc = float(str(row[cpc_col]).replace("$","").replace(",",".") or 0)
                except: cpc = 0.0

            if vol > 0 or pos > 0:
                all_keywords.append({
                    "keyword":  kw,
                    "volume":   vol,
                    "position": pos,
                    "cpc":      cpc,
                    "source":   fpath.stem,
                })
                parsed += 1

        log.success(f"Semrush keywords parseadas: {fpath.name}",
                    keywords=parsed,
                    kw_col=str(kw_col),
                    vol_col=str(vol_col))

    # Remove duplicatas (mantém o de maior volume)
    deduped = {}
    for kw in all_keywords:
        key = kw["keyword"]
        if key not in deduped or kw["volume"] > deduped[key]["volume"]:
            deduped[key] = kw

    result = list(deduped.values())
    log.success(f"Total keywords Semrush (deduplicado)",
                count=len(result),
                sample=str([k["keyword"] for k in
                            sorted(result, key=lambda x: x["volume"],
                                   reverse=True)[:5]]))
    return result


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SIMILARWEB — leitura dos exports
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def read_similarweb(log: Logger) -> dict:
    """
    Lê exports .xlsx do SimilarWeb em data/similarweb/.
    Detecta automaticamente Overview vs Geography.
    """
    result = {"overview": {}, "countries": []}
    files  = list(SW_DIR.glob("*.xlsx")) + list(SW_DIR.glob("*.csv"))

    if not files:
        log.info("Nenhum arquivo SimilarWeb encontrado — opcional",
                 pasta=str(SW_DIR.resolve()),
                 status="continuando sem dados de tráfego")
        return result

    log.info(f"Arquivos SimilarWeb encontrados",
             count=len(files), files=str([f.name for f in files]))

    for fpath in files:
        df = _read_file(fpath, log)
        if df is None or df.empty:
            continue

        cols = {str(c).lower().strip(): c for c in df.columns}

        # Overview: coluna de visitas
        if any(c in cols for c in ["visits","unique visits","total visits","monthly visits"]):
            ov = _parse_sw_overview(df, cols, log)
            if ov:
                result["overview"] = ov
                log.success("SimilarWeb Overview lido",
                            file=fpath.name,
                            avg_monthly=ov.get("avg_monthly_visits"))

        # Geography: coluna de país
        elif any(c in cols for c in ["country","country name","geography","countries"]):
            countries = _parse_sw_countries(df, cols, log)
            if countries:
                result["countries"] = countries
                log.success("SimilarWeb Geography lido",
                            file=fpath.name,
                            countries=len(countries),
                            top3=str([c["country"] for c in countries[:3]]))

        else:
            log.warning(f"Tipo de export SW não reconhecido: {fpath.name}",
                        colunas=str(list(cols.keys())[:6]))

    return result


def _parse_sw_overview(df, cols: dict, log: Logger) -> dict:
    col = next((cols[c] for c in ["visits","unique visits","total visits","monthly visits"]
                if c in cols), None)
    if col is None:
        return {}
    try:
        v = (pd.to_numeric(
                df[col].astype(str)
                       .str.replace(",","")
                       .str.replace(" ",""),
                errors="coerce")
             .dropna())
        if v.empty:
            return {}
        avg = int(v.mean())
        log.info("Overview SW processado",
                 avg_monthly=avg, data_points=len(v))
        return {"avg_monthly_visits": avg, "months": len(v)}
    except Exception as exc:
        log.error("Erro ao parsear Overview SW", exc=exc)
        return {}


def _parse_sw_countries(df, cols: dict, log: Logger) -> list:
    c_col = next((cols[c] for c in ["country","country name","geography","countries"]
                  if c in cols), None)
    s_col = next((cols[c] for c in ["traffic share","share","% of traffic",
                                    "share of visits","%"]
                  if c in cols), None)
    if c_col is None:
        return []

    out = []
    for _, row in df.iterrows():
        name = str(row[c_col]).strip()
        if not name or name.lower() in ("nan","country","total"):
            continue
        share = 0.0
        if s_col:
            try:
                raw = str(row[s_col]).replace("%","").replace(",",".").strip()
                share = float(raw)
                if share > 1:
                    share /= 100  # estava em percentual, converte para decimal
            except:
                pass
        if share * 100 >= 0.3 or share == 0.0:
            out.append({
                "country":   name,
                "share_pct": round(share * 100, 2),
            })

    return sorted(out, key=lambda x: x["share_pct"], reverse=True)[:20]


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CLASSIFICAÇÃO E PRIORIZAÇÃO
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def classify(keywords: list[dict], log: Logger) -> dict:
    """
    Classifica cada keyword na categoria correta.
    Calcula score de prioridade para ordenar as categorias.

    Priority score = volume × (1 + cpc×0.1) / max(avg_position, 1)
    Lógica: alto volume + CPC alto + concorrente em posição baixa = oportunidade maior
    """
    scores = defaultdict(lambda: {
        "volume": 0, "count": 0,
        "cpc_sum": 0.0, "pos_sum": 0, "pos_count": 0,
        "keywords": []
    })

    unmatched = 0
    for kw in keywords:
        phrase = kw["keyword"]
        volume = kw["volume"]
        pos    = kw["position"]
        cpc    = kw["cpc"]

        matched = False
        for slug, patterns in CATEGORY_MAP:
            if any(p in phrase for p in patterns):
                scores[slug]["volume"]   += volume
                scores[slug]["count"]    += 1
                scores[slug]["cpc_sum"]  += cpc
                if pos > 0:
                    scores[slug]["pos_sum"]  += pos
                    scores[slug]["pos_count"] += 1
                scores[slug]["keywords"].append({
                    "keyword":  phrase,
                    "volume":   volume,
                    "position": pos,
                    "cpc":      cpc,
                })
                matched = True
                break

        if not matched:
            unmatched += 1

    # Calcula médias e priority score
    result = {}
    for slug, d in scores.items():
        avg_pos = d["pos_sum"] / d["pos_count"] if d["pos_count"] > 0 else 0
        avg_cpc = d["cpc_sum"] / d["count"]     if d["count"] > 0     else 0
        priority = int(d["volume"] * (1 + avg_cpc * 0.1) / max(avg_pos, 1))
        result[slug] = {
            "volume":    d["volume"],
            "count":     d["count"],
            "avg_cpc":   round(avg_cpc, 2),
            "avg_pos":   round(avg_pos, 1),
            "priority":  priority,
            "keywords":  sorted(d["keywords"],
                                key=lambda x: x["volume"],
                                reverse=True)[:10],
        }

    ranked_top3 = sorted(result.items(),
                         key=lambda x: x[1]["priority"], reverse=True)[:3]
    log.success("Keywords classificadas",
        categories_encontradas=len(result),
        keywords_sem_match=unmatched,
        top3=str([(s, d["volume"]) for s, d in ranked_top3]))
    return result


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ALIMENTAR BANCO
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def seed_categories(db, scores: dict, log: Logger) -> int:
    """
    Atualiza categories com dados SEO reais.
    sort_order = posição no ranking de potencial (1 = maior oportunidade)
    is_trending = True para as 15 com maior volume
    """
    log.info("Atualizando categories no banco")
    ranked       = sorted(scores.items(),
                          key=lambda x: x[1]["priority"], reverse=True)
    trending_set = {s for s, _ in ranked[:15]}
    updated      = 0

    for rank, (slug, data) in enumerate(ranked, start=1):
        cat_type    = "country" if slug in COUNTRY_SLUGS else "genre"
        is_trending = slug in trending_set
        try:
            ex = db.table("categories").select("id").eq("slug", slug).execute()
            if ex.data:
                db.table("categories").update({
                    "is_trending": is_trending,
                    "sort_order":  rank,
                }).eq("slug", slug).execute()
                log.success(f"category atualizada: {slug}",
                            rank=rank, trending=is_trending,
                            volume=data["volume"])
            else:
                db.table("categories").insert({
                    "slug":        slug,
                    "name":        slug.replace("-"," ").title(),
                    "type":        cat_type,
                    "is_trending": is_trending,
                    "sort_order":  rank,
                }).execute()
                log.success(f"category CRIADA: {slug}",
                            rank=rank, volume=data["volume"])
            updated += 1
        except Exception as exc:
            log.error(f"Falha em category: {slug}", exc=exc)

    log.success("categories atualizadas",
                total=updated,
                trending=str(sorted(trending_set)[:5]))
    return updated


def seed_top_lists(db, scores: dict, log: Logger) -> int:
    """
    Cria/atualiza top_lists com seo_title e seo_description
    baseados nas keywords reais detectadas no Semrush.
    """
    log.info("Atualizando top_lists no banco")
    YEAR    = datetime.date.today().year
    created = 0

    for slug, data in sorted(scores.items(),
                              key=lambda x: x[1]["priority"], reverse=True):
        if data["volume"] < 100:
            continue

        name   = slug.replace("-", " ").title()
        top_kw = (data["keywords"][0]["keyword"]
                  if data["keywords"] else f"{name} telegram group")

        # Title inclui keyword exata detectada + year
        seo_title = (
            f"Best {name} Telegram Groups {YEAR} "
            f"— Top 10 Verified | {SITE_NAME}"
        )[:70]

        # Description menciona volume implicitamente com CTA
        seo_desc = (
            f"Discover the best {name.lower()} Telegram groups and channels in {YEAR}. "
            f"Join thousands of verified members. "
            f"Updated daily — find the top {name.lower()} communities now."
        )[:160]

        try:
            ex = db.table("top_lists").select("id").eq("slug", slug).execute()
            payload = {
                "title":           f"Best {name} Telegram Groups",
                "description":     seo_desc,
                "category_slug":   slug,
                "seo_title":       seo_title,
                "seo_description": seo_desc,
                "updated_at":      datetime.datetime.utcnow().isoformat() + "Z",
            }
            if ex.data:
                db.table("top_lists").update(payload).eq("slug", slug).execute()
                log.success(f"top_list atualizada: /best-telegram-groups/{slug}",
                            volume=data["volume"], top_kw=top_kw)
            else:
                db.table("top_lists").insert({
                    "slug": slug,
                    **payload,
                    "published_at": datetime.datetime.utcnow().isoformat() + "Z",
                }).execute()
                log.success(f"top_list CRIADA: /best-telegram-groups/{slug}",
                            volume=data["volume"], top_kw=top_kw)
            created += 1
        except Exception as exc:
            log.error(f"Falha em top_list: {slug}", exc=exc)

    log.success("top_lists concluídas", total=created)
    return created


def save_ranking(db, scores: dict, log: Logger):
    """
    Salva ranking de categorias em seo_config.
    Outros scripts (ai_content_generator) usam isso para priorizar.
    """
    ranking = [
        {
            "rank":          i + 1,
            "slug":          slug,
            "volume":        data["volume"],
            "priority":      data["priority"],
            "avg_cpc":       data["avg_cpc"],
            "avg_pos_competitor": data["avg_pos"],
            "top_keywords":  [k["keyword"] for k in data["keywords"][:3]],
        }
        for i, (slug, data) in enumerate(
            sorted(scores.items(),
                   key=lambda x: x[1]["priority"], reverse=True)
        )
    ]
    try:
        db.table("seo_config").upsert({
            "key":   "category_ranking",
            "value": {
                "generated_at": datetime.datetime.utcnow().isoformat() + "Z",
                "target":       "erogram.pro",
                "ranking":      ranking,
            },
            "updated_at": datetime.datetime.utcnow().isoformat() + "Z",
        }).execute()
        log.success("category_ranking salvo em seo_config",
                    categorias=len(ranking),
                    top1=ranking[0]["slug"] if ranking else "?")
    except Exception as exc:
        log.error("Falha ao salvar ranking em seo_config", exc=exc)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# RELATÓRIO — O output mais importante
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def print_report(scores: dict, sw: dict, keywords: list,
                 cats_updated: int, lists_created: int, log: Logger):
    SEP  = "=" * 64
    YEAR = datetime.date.today().year

    lines = [
        "", SEP,
        f"  SEO BOOTSTRAP COMPLETO — {SITE_NAME}",
        f"  Alvo analisado: erogram.pro",
        f"  {datetime.datetime.now():%Y-%m-%d %H:%M}",
        SEP,
    ]

    # Tráfego SimilarWeb
    ov = sw.get("overview", {})
    lines.append("\n📊 TRÁFEGO DO CONCORRENTE (SimilarWeb)")
    if ov.get("avg_monthly_visits"):
        lines.append(f"  Visitas mensais (média): ~{ov['avg_monthly_visits']:,}/mês")
        lines.append(f"  Período analisado: {ov.get('months','?')} meses")
    else:
        lines.append("  Sem dados — coloque o export em data/similarweb/")

    countries = sw.get("countries", [])
    if countries:
        lines.append("\n🌍 TOP PAÍSES (sua audiência-alvo EN/EU):")
        for c in countries[:8]:
            bar = "█" * max(1, int(c["share_pct"] / 2))
            lines.append(f"  {c['country']:<20} {bar} {c['share_pct']:.1f}%")

    # Keywords Semrush
    lines.append(f"\n🔑 SEMRUSH — Keywords analisadas: {len(keywords)}")
    if keywords:
        top_kws = sorted(keywords, key=lambda x: x["volume"], reverse=True)[:10]
        lines.append(f"  {'Keyword':<42} {'Vol/mês':>8}  {'Pos':>4}  {'CPC':>6}")
        lines.append(f"  {'-'*64}")
        for kw in top_kws:
            ph  = kw["keyword"][:40]
            vol = kw["volume"]
            pos = kw["position"] or "-"
            cpc = f"${kw['cpc']:.2f}" if kw["cpc"] > 0 else "-"
            lines.append(f"  {ph:<42} {vol:>8,}  {str(pos):>4}  {cpc:>6}")

    # Ranking de categorias — O mais importante
    ranked = sorted(scores.items(),
                    key=lambda x: x[1]["priority"], reverse=True)

    lines += [
        "", SEP,
        "  ▶ QUAIS CATEGORIAS PRIORIZAR NOS PRIMEIROS 50 GRUPOS",
        "    (ordenado por potencial real de tráfego EN)",
        SEP,
        f"  {'#':<3} {'Categoria':<25} {'Vol/mês':>9}  {'Pos concorrente':>15}  {'CPC':>6}",
        f"  {'-'*3} {'-'*25} {'-'*9}  {'-'*15}  {'-'*6}",
    ]

    for i, (slug, d) in enumerate(ranked[:20], 1):
        pos_str = f"pos {d['avg_pos']:.0f}" if d["avg_pos"] > 0 else "novo"
        cpc_str = f"${d['avg_cpc']:.2f}"    if d["avg_cpc"] > 0 else "-"
        top_kw  = d["keywords"][0]["keyword"][:25] if d["keywords"] else ""
        lines.append(
            f"  {i:<3} {slug:<25} {d['volume']:>9,}  {pos_str:>15}  {cpc_str:>6}"
            f"  ← {top_kw}"
        )

    lines += [
        "", SEP,
        "  ✅ BANCO ATUALIZADO:",
        f"  → categories atualizadas/criadas: {cats_updated}",
        f"  → top_lists criadas/atualizadas:  {lists_created}",
        f"  → seo_config.category_ranking:    salvo",
        "",
        "  📋 AÇÃO IMEDIATA:",
        "  Use o ranking acima para escolher os 50 grupos do sandbox.",
        "  Ex: se 'milf' é #1 → coloque os grupos MILF com mais membros primeiro.",
        "",
        "  🔜 PRÓXIMO PASSO:",
        "  python scripts/ingestion/ai_content_generator.py",
        SEP, "",
    ]

    report = "\n".join(lines)
    print(report)

    Path("logs").mkdir(exist_ok=True)
    ts   = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    path = Path(f"logs/seo_bootstrap_{ts}.txt")
    path.write_text(report, encoding="utf-8")
    log.success("Relatório salvo", path=str(path))


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# MAIN
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def main():
    log = Logger("seo_bootstrap")
    _ensure_dirs()

    if not PANDAS_OK:
        log.fatal(
            "pandas não instalado — obrigatório para leitura dos arquivos",
            action="rode: pip install pandas openpyxl"
        )

    db = create_client(SUPABASE_URL, os.environ["SUPABASE_SERVICE_ROLE_KEY"])

    log.separator("1/5 — LENDO ARQUIVOS SEMRUSH")
    keywords = read_semrush(log)

    log.separator("2/5 — LENDO ARQUIVOS SIMILARWEB")
    sw = read_similarweb(log)

    if not keywords:
        log.warning(
            "Sem dados Semrush — coloque os exports em data/semrush/",
            instrucao="Semrush → erogram.pro → Organic Research → Export",
            impacto="banco não será alimentado sem keywords"
        )
        log.finalize()
        return

    log.separator("3/5 — CLASSIFICAÇÃO E PRIORIZAÇÃO")
    scores = classify(keywords, log)

    log.separator("4/5 — ALIMENTANDO BANCO")
    cats  = seed_categories(db, scores, log)
    lists = seed_top_lists(db, scores, log)
    save_ranking(db, scores, log)

    log.separator("5/5 — RELATÓRIO FINAL")
    print_report(scores, sw, keywords, cats, lists, log)

    log.finalize()


if __name__ == "__main__":
    main()
