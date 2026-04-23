import { createClient } from '@/lib/supabase/server'
import type { Article } from '@/types/database'

function isConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !!url && /^https?:\/\//.test(url) && !!key && key !== 'PREENCHER'
}

export async function getArticles(limit = 24, offset = 0): Promise<Article[]> {
  if (!isConfigured()) return []
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('articles')
      .select('id, slug, title, excerpt, cover_image_url, author, published_at, read_time_min, tags')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1)
    return (data ?? []) as Article[]
  } catch { return [] }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (!isConfigured()) return null
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()
    return data as Article | null
  } catch { return null }
}
