import { createClient } from '@/lib/supabase/server'
import { createClient as createPlainClient } from '@supabase/supabase-js'
import type { Group } from '@/types/database'

const PAGE_SIZE = 20
const PUBLISHED = ['published', 'submitted', 'indexed']

// True once .env.local traz credenciais reais (http[s] URL + anon key).
function isConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !!url && /^https?:\/\//.test(url) && !!key && key !== 'PREENCHER'
}

export interface GroupFilters {
  category?:   string
  country?:    string
  search?:     string
  sort?:       'newest' | 'popular' | 'members'
  page?:       number
  entityType?: string | string[]   // 'group' | 'channel' | 'bot' | array
}

export async function getGroups(filters: GroupFilters = {}) {
  const { sort = 'newest', page = 1 } = filters
  if (!isConfigured()) {
    return { groups: [] as Group[], total: 0, page, totalPages: 0 }
  }

  const supabase = await createClient()
  const { category, country, search, entityType } = filters
  const offset = (page - 1) * PAGE_SIZE

  let query = supabase
    .from('groups')
    .select('*', { count: 'exact' })
    .in('indexing_status', PUBLISHED)
    .eq('hidden', false)
    .eq('status', 'active')

  // Bug fix: filter entity_type in DB, not JS
  if (entityType) {
    if (Array.isArray(entityType)) {
      query = query.in('entity_type', entityType)
    } else {
      query = query.eq('entity_type', entityType)
    }
  }

  // Bug fix: category slugs are lowercase-dashed in DB → pass them that way
  if (category) query = query.eq('category_slug', category.toLowerCase())

  if (country) query = query.ilike('country', country)

  // Bug fix: use ilike instead of textSearch (no FTS index required)
  if (search) query = query.ilike('name', `%${search.trim()}%`)

  switch (sort) {
    case 'popular': query = query.order('click_count',  { ascending: false }); break
    case 'members': query = query.order('member_count', { ascending: false }); break
    default:        query = query.order('published_at', { ascending: false })
  }

  const { data, count, error } = await query.range(offset, offset + PAGE_SIZE - 1)
  if (error) throw error

  return {
    groups:     (data ?? []) as Group[],
    total:      count ?? 0,
    page,
    totalPages: Math.ceil((count ?? 0) / PAGE_SIZE),
  }
}

export async function getGroupBySlug(slug: string): Promise<Group | null> {
  if (!isConfigured()) return null
  const supabase = await createClient()
  const { data } = await supabase
    .from('groups')
    .select('*')
    .eq('slug', slug)
    .in('indexing_status', PUBLISHED)
    .eq('hidden', false)
    .single()
  return data as Group | null
}

export async function getSimilarGroups(categorySlug: string, excludeSlug: string, limit = 6): Promise<Group[]> {
  if (!isConfigured()) return []
  const supabase = await createClient()
  const { data } = await supabase
    .from('groups')
    .select('id, slug, name, thumbnail_url, category_slug, member_count')
    .eq('category_slug', categorySlug)
    .in('indexing_status', PUBLISHED)
    .eq('hidden', false)
    .neq('slug', excludeSlug)
    .order('member_count', { ascending: false })
    .limit(limit)
  return (data ?? []) as Group[]
}

export async function getFreshGroups(limit = 8): Promise<Group[]> {
  if (!isConfigured()) return []
  const supabase = await createClient()
  const { data } = await supabase
    .from('groups')
    .select('id, slug, name, thumbnail_url, category_slug, member_count, is_new, is_verified')
    .in('indexing_status', PUBLISHED)
    .eq('hidden', false)
    .eq('status', 'active')
    .order('published_at', { ascending: false })
    .limit(limit)
  return (data ?? []) as Group[]
}

export async function getAllPublishedSlugs() {
  // Cliente sem cookies: rodado em generateStaticParams / sitemap (build-time).
  if (!isConfigured()) return []
  const supabase = createPlainClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await supabase
    .from('groups')
    .select('slug, updated_at')
    .in('indexing_status', PUBLISHED)
    .eq('hidden', false)
  return data ?? []
}
