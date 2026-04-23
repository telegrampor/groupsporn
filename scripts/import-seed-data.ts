/**
 * Import erogram_seed_data.json → Supabase groups table
 *
 * Usage:
 *   npx tsx scripts/import-seed-data.ts
 *
 * Set env vars before running (reads .env.local automatically):
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ...   ← preferred (bypasses RLS)
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...  ← fallback
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
  const lines = readFileSync(path, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    if (!(key in process.env)) process.env[key] = val
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

// ── Helpers ────────────────────────────────────────────
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80)
}

function mapCategorySlug(item: SeedItem): string {
  if (item.type === 'bot')     return 'bot'
  if (item.type === 'ai_tool') return 'ai-nsfw'

  const combined = `${item.name} ${item.description ?? ''}`.toLowerCase()

  if (combined.match(/cosplay/))                             return 'cosplay'
  if (combined.match(/\bindian\b|\bdesi\b|\bhindi\b/))      return 'asian'
  if (combined.match(/colombian|colombia|\blatina\b|latin/)) return 'latina'
  if (combined.match(/\bmilf\b/))                            return 'milf'
  if (combined.match(/\blesbian\b/))                         return 'lesbian'
  if (combined.match(/onlyfan/))                             return 'onlyfans'
  if (combined.match(/\banime\b|\bhentai\b/))               return 'anime'
  if (combined.match(/\bbdsm\b|\bbondage\b/))               return 'bdsm'
  if (combined.match(/\banal\b/))                            return 'anal'
  if (combined.match(/\bamateur\b/))                         return 'amateur'
  if (item.category.toLowerCase().includes('onlyfan'))       return 'onlyfans'

  return 'adult'
}

// JSON "type" → DB entity_type enum  (ai_tool → channel, no ai_tool in schema)
function mapEntityType(type: string): 'group' | 'channel' | 'bot' {
  if (type === 'bot')     return 'bot'
  if (type === 'ai_tool') return 'channel'
  return 'group'
}

// ── Main ───────────────────────────────────────────────
async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error('❌  Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } })

  const jsonPath = resolve(root, 'erogram_seed_data.json')
  const raw: SeedItem[] = JSON.parse(readFileSync(jsonPath, 'utf-8'))
  console.log(`📄  Loaded ${raw.length} raw entries`)

  // ── Transform ──────────────────────────────────────
  const seenSlugs = new Set<string>()
  const rows: Record<string, unknown>[] = []
  let skipped = 0

  for (const item of raw) {
    if (!item.name?.trim())                                   { skipped++; continue }
    if (item.category === '🔒UNLOCK PREMIUM GROUPS')         { skipped++; continue }
    if (item.name === 'Recent Groups' && !item.slug?.trim()) { skipped++; continue }

    let slug = item.slug?.trim() ? item.slug.trim() : slugify(item.name)
    if (!slug) { skipped++; continue }

    // Resolve duplicate slugs within this batch
    if (seenSlugs.has(slug)) {
      slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`
    }
    seenSlugs.add(slug)

    rows.push({
      slug,
      name:             item.name.trim(),
      description:      item.description?.trim() || null,
      telegram_url:     item.telegram_url || null,
      telegram_handle:  item.telegram_url?.replace(/^https?:\/\/t\.me\//i, '').replace(/\/$/, '') || null,
      thumbnail_url:    item.image_url?.trim() || null,
      category_slug:    mapCategorySlug(item),
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
  console.log(`✅  Transformed ${rows.length} rows (skipped ${skipped})`)
  console.log(`   groups: ${byType('group')}  bots: ${byType('bot')}  ai_tools→channel: ${byType('channel')}`)

  // ── Upsert in batches ──────────────────────────────
  const BATCH = 50
  let upserted = 0, errors = 0

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH)
    const { data, error } = await supabase
      .from('groups')
      .upsert(batch, { onConflict: 'slug' })
      .select('slug')

    if (error) {
      console.error(`❌  Batch ${Math.floor(i / BATCH) + 1} error:`, error.message)
      errors += batch.length
    } else {
      upserted += data?.length ?? 0
      console.log(`   Batch ${Math.floor(i / BATCH) + 1}: ${data?.length ?? 0} upserted`)
    }
  }

  console.log(`\n🎉  Done — ${upserted} upserted, ${errors} errors, ${skipped} skipped`)
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
