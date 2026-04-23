/**
 * Import erogram_seed_data.json → Supabase
 *
 * Strategy:
 *   1. Upsert ALL required categories into `categories` (FK parent)
 *   2. Upsert groups from JSON (FK child)
 *
 * Usage:
 *   npx tsx scripts/import-seed-data.ts
 *
 * Env vars (reads .env.local automatically):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   ← preferred (bypasses RLS)
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY  ← fallback
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

// ── Load .env.local without dotenv ────────────────────
function loadEnvFile(path: string) {
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf-8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq === -1) continue
    const k = t.slice(0, eq).trim()
    const v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    if (!(k in process.env)) process.env[k] = v
  }
}
loadEnvFile(resolve(root, '.env.local'))
loadEnvFile(resolve(root, '.env'))

// ── Types ──────────────────────────────────────────────
interface SeedItem {
  name:         string
  slug:         string
  description:  string
  category:     string
  image_url:    string
  type:         'group' | 'bot' | 'ai_tool'
  status:       string
  telegram_url: string | null
}

// ── All categories the app uses (must exist before inserting groups) ──
// type: 'genre' for content, 'country' for geographic
const ALL_CATEGORIES: Array<{
  slug: string; name: string; type: 'genre' | 'country'; sort_order: number; is_trending: boolean
}> = [
  // Content genres
  { slug: 'adult',         name: 'Adult',           type: 'genre',   sort_order: 1,  is_trending: true  },
  { slug: 'amateur',       name: 'Amateur',          type: 'genre',   sort_order: 2,  is_trending: true  },
  { slug: 'anal',          name: 'Anal',             type: 'genre',   sort_order: 3,  is_trending: false },
  { slug: 'anime',         name: 'Anime',            type: 'genre',   sort_order: 4,  is_trending: false },
  { slug: 'bdsm',          name: 'BDSM',             type: 'genre',   sort_order: 5,  is_trending: false },
  { slug: 'big-ass',       name: 'Big Ass',          type: 'genre',   sort_order: 6,  is_trending: false },
  { slug: 'big-tits',      name: 'Big Tits',         type: 'genre',   sort_order: 7,  is_trending: false },
  { slug: 'blonde',        name: 'Blonde',           type: 'genre',   sort_order: 8,  is_trending: false },
  { slug: 'blowjob',       name: 'Blowjob',          type: 'genre',   sort_order: 9,  is_trending: true  },
  { slug: 'bot',           name: 'Bots',             type: 'genre',   sort_order: 10, is_trending: false },
  { slug: 'cosplay',       name: 'Cosplay',          type: 'genre',   sort_order: 11, is_trending: false },
  { slug: 'creampie',      name: 'Creampie',         type: 'genre',   sort_order: 12, is_trending: false },
  { slug: 'cuckold',       name: 'Cuckold',          type: 'genre',   sort_order: 13, is_trending: false },
  { slug: 'ebony',         name: 'Ebony',            type: 'genre',   sort_order: 14, is_trending: false },
  { slug: 'fantasy',       name: 'Fantasy',          type: 'genre',   sort_order: 15, is_trending: false },
  { slug: 'feet',          name: 'Feet',             type: 'genre',   sort_order: 16, is_trending: false },
  { slug: 'fetish',        name: 'Fetish',           type: 'genre',   sort_order: 17, is_trending: false },
  { slug: 'free-use',      name: 'Free-use',         type: 'genre',   sort_order: 18, is_trending: false },
  { slug: 'ai-nsfw',       name: 'AI NSFW',          type: 'genre',   sort_order: 19, is_trending: true  },
  { slug: 'latina',        name: 'Latina',           type: 'genre',   sort_order: 20, is_trending: true  },
  { slug: 'lesbian',       name: 'Lesbian',          type: 'genre',   sort_order: 21, is_trending: true  },
  { slug: 'masturbation',  name: 'Masturbation',     type: 'genre',   sort_order: 22, is_trending: false },
  { slug: 'milf',          name: 'MILF',             type: 'genre',   sort_order: 23, is_trending: true  },
  { slug: 'nsfw-telegram', name: 'NSFW Telegram',    type: 'genre',   sort_order: 24, is_trending: false },
  { slug: 'onlyfans',      name: 'OnlyFans',         type: 'genre',   sort_order: 25, is_trending: true  },
  { slug: 'petite',        name: 'Petite',           type: 'genre',   sort_order: 26, is_trending: false },
  { slug: 'public',        name: 'Public',           type: 'genre',   sort_order: 27, is_trending: false },
  { slug: 'telegram-porn', name: 'Telegram Porn',    type: 'genre',   sort_order: 28, is_trending: false },
  { slug: 'threesome',     name: 'Threesome',        type: 'genre',   sort_order: 29, is_trending: true  },
  // Country genres
  { slug: 'asian',         name: 'Asian',            type: 'country', sort_order: 30, is_trending: true  },
  { slug: 'brazil',        name: 'Brazil',           type: 'country', sort_order: 31, is_trending: false },
  { slug: 'china',         name: 'China',            type: 'country', sort_order: 32, is_trending: false },
  { slug: 'colombia',      name: 'Colombia',         type: 'country', sort_order: 33, is_trending: false },
  { slug: 'france',        name: 'France',           type: 'country', sort_order: 34, is_trending: false },
  { slug: 'germany',       name: 'Germany',          type: 'country', sort_order: 35, is_trending: false },
  { slug: 'italy',         name: 'Italy',            type: 'country', sort_order: 36, is_trending: false },
  { slug: 'japan',         name: 'Japan',            type: 'country', sort_order: 37, is_trending: false },
  { slug: 'mexico',        name: 'Mexico',           type: 'country', sort_order: 38, is_trending: false },
  { slug: 'philippines',   name: 'Philippines',      type: 'country', sort_order: 39, is_trending: false },
  { slug: 'russian',       name: 'Russian',          type: 'country', sort_order: 40, is_trending: false },
  { slug: 'spain',         name: 'Spain',            type: 'country', sort_order: 41, is_trending: false },
  { slug: 'uk',            name: 'UK',               type: 'country', sort_order: 42, is_trending: false },
  { slug: 'ukraine',       name: 'Ukraine',          type: 'country', sort_order: 43, is_trending: false },
  { slug: 'usa',           name: 'USA',              type: 'country', sort_order: 44, is_trending: false },
  { slug: 'vietnam',       name: 'Vietnam',          type: 'country', sort_order: 45, is_trending: false },
]

// ── Helpers ────────────────────────────────────────────
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80)
}

const VALID_SLUGS = new Set(ALL_CATEGORIES.map(c => c.slug))

function mapCategorySlug(item: SeedItem): string {
  if (item.type === 'bot')     return 'bot'
  if (item.type === 'ai_tool') return 'ai-nsfw'

  const combined = `${item.name} ${item.description ?? ''}`.toLowerCase()

  if (combined.match(/cosplay/))                              return 'cosplay'
  if (combined.match(/\bindian\b|\bdesi\b|\bhindi\b/))       return 'asian'
  if (combined.match(/colombian|colombia|\blatina\b|latin/)) return 'latina'
  if (combined.match(/\bmilf\b/))                            return 'milf'
  if (combined.match(/\blesbian\b/))                         return 'lesbian'
  if (combined.match(/onlyfan/))                             return 'onlyfans'
  if (combined.match(/\banime\b|\bhentai\b/))                return 'anime'
  if (combined.match(/\bbdsm\b|\bbondage\b/))                return 'bdsm'
  if (combined.match(/\banal\b/))                            return 'anal'
  if (combined.match(/\bamateur\b/))                         return 'amateur'
  if (combined.match(/twerk|fap/))                           return 'adult'
  if (item.category.toLowerCase().includes('onlyfan'))       return 'onlyfans'

  return 'adult' // always valid — 'adult' is in ALL_CATEGORIES
}

function mapEntityType(type: string): 'group' | 'channel' | 'bot' {
  if (type === 'bot')     return 'bot'
  if (type === 'ai_tool') return 'channel'  // ai_tool not in EntityType enum
  return 'group'
}

// ── Main ───────────────────────────────────────────────
async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error('❌  Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } })

  // ── Step 1: Upsert categories (FK parent) ──────────
  console.log('📂  Step 1 — Upserting categories...')
  const { data: catData, error: catError } = await supabase
    .from('categories')
    .upsert(ALL_CATEGORIES, { onConflict: 'slug' })
    .select('slug')

  if (catError) {
    // If table doesn't exist, log and continue — groups table might not enforce FK
    if (catError.code === '42P01') {
      console.warn('⚠️   categories table not found — skipping category upsert')
      console.warn('     If groups insert fails with FK error, create the categories table first.')
    } else {
      console.error('❌  categories upsert error:', catError.message, catError.code)
      console.error('    Continuing — will attempt group inserts anyway...')
    }
  } else {
    console.log(`✅  Categories upserted: ${catData?.length ?? 0} / ${ALL_CATEGORIES.length}`)
  }

  // ── Step 2: Transform JSON ─────────────────────────
  console.log('\n📄  Step 2 — Loading erogram_seed_data.json...')
  const jsonPath = resolve(root, 'erogram_seed_data.json')
  const raw: SeedItem[] = JSON.parse(readFileSync(jsonPath, 'utf-8'))
  console.log(`    Loaded ${raw.length} raw entries`)

  const seenSlugs = new Set<string>()
  const rows: Record<string, unknown>[] = []
  let skipped = 0

  for (const item of raw) {
    // Skip invalid / UI-artifact entries
    if (!item.name?.trim())                         { skipped++; continue }
    if (item.category === '🔒UNLOCK PREMIUM GROUPS') { skipped++; continue }
    if (!item.slug?.trim() && item.name === 'Recent Groups') { skipped++; continue }

    let slug = item.slug?.trim() ? item.slug.trim() : slugify(item.name)
    if (!slug) { skipped++; continue }

    // Resolve duplicate slugs within this batch
    let finalSlug = slug
    let attempt = 0
    while (seenSlugs.has(finalSlug)) {
      attempt++
      finalSlug = `${slug}-${attempt}`
    }
    seenSlugs.add(finalSlug)

    const categorySlug = mapCategorySlug(item)

    // Safety check: if the inferred category is not in our list, fall back to 'adult'
    const safeCategory = VALID_SLUGS.has(categorySlug) ? categorySlug : 'adult'

    rows.push({
      slug:             finalSlug,
      name:             item.name.trim(),
      description:      item.description?.trim() || null,
      telegram_url:     item.telegram_url || null,
      telegram_handle:  item.telegram_url?.replace(/^https?:\/\/t\.me\//i, '').replace(/\/$/, '') || null,
      thumbnail_url:    item.image_url?.trim() || null,
      category_slug:    safeCategory,
      country:          'All',
      member_count:     0,
      view_count:       0,
      click_count:      0,
      is_featured:      false,
      is_premium:       false,
      is_verified:      false,
      is_new:           true,
      entity_type:      mapEntityType(item.type),
      status:           'active',       // always active per spec
      hidden:           false,
      broken:           false,
      indexing_status:  'published',    // visible immediately
      quality_score:    50,
      published_at:     new Date().toISOString(),
      source:           'seed-json',
    })
  }

  const byType = (t: string) => rows.filter(r => r.entity_type === t).length
  console.log(`✅  Transformed ${rows.length} rows, skipped ${skipped}`)
  console.log(`    groups: ${byType('group')}  |  bots: ${byType('bot')}  |  ai_tools→channel: ${byType('channel')}`)

  // Category distribution
  const catDist: Record<string, number> = {}
  for (const r of rows) {
    const c = r.category_slug as string
    catDist[c] = (catDist[c] ?? 0) + 1
  }
  console.log('    Category distribution:', catDist)

  // ── Step 3: Upsert groups in batches ───────────────
  console.log('\n🚀  Step 3 — Upserting groups...')
  const BATCH = 25
  let upserted = 0
  let errors   = 0

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH)
    const { data, error } = await supabase
      .from('groups')
      .upsert(batch, { onConflict: 'slug' })
      .select('slug')

    if (error) {
      console.error(`❌  Batch ${Math.floor(i / BATCH) + 1} error [${error.code}]: ${error.message}`)

      // Show which category slugs are in this batch (helps debug FK errors)
      const batchCats = [...new Set(batch.map(r => r.category_slug as string))]
      console.error(`    Categories in this batch: ${batchCats.join(', ')}`)
      errors += batch.length
    } else {
      upserted += data?.length ?? 0
      process.stdout.write(`    Batch ${Math.floor(i / BATCH) + 1}: ${data?.length ?? 0} upserted\n`)
    }
  }

  console.log(`\n🎉  Done — ${upserted} upserted, ${errors} errors, ${skipped} skipped`)

  if (errors > 0) {
    console.log('\n💡  If you see FK errors:')
    console.log('    1. Confirm the categories table name in Supabase → Table Editor')
    console.log('    2. Check if groups.category_slug has a FK constraint (Supabase → Table Editor → groups → FK)')
    console.log('    3. Run: SELECT slug FROM categories; — to see which slugs already exist')
    console.log('    4. Or temporarily disable the FK: ALTER TABLE groups DROP CONSTRAINT <fk_name>;')
  }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
