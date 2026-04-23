export type ContentStatus = 'active' | 'broken' | 'pending' | 'premium'
export type IndexingStatus = 'draft' | 'queued' | 'published' | 'submitted' | 'indexed' | 'deindexed'
export type EntityType = 'channel' | 'group' | 'bot'

export interface Category {
  id: number
  slug: string
  name: string
  type: 'genre' | 'country'
  icon?: string
  sort_order: number
  is_trending: boolean
  created_at: string
}

export interface Group {
  id: number
  slug: string
  name: string
  description?: string
  telegram_url?: string
  telegram_handle?: string
  thumbnail_url?: string
  category_slug: string
  country: string
  tags?: string[]
  member_count: number
  view_count: number
  click_count: number
  is_featured: boolean
  is_premium: boolean
  is_verified: boolean
  is_new: boolean
  entity_type: EntityType
  status: ContentStatus
  hidden: boolean
  broken: boolean
  published_at?: string
  indexing_status: IndexingStatus
  submitted_at?: string
  quality_score: number
  seo_title?: string
  seo_description?: string
  source?: string
  batch_number?: number
  created_at: string
  updated_at: string
}

export interface Bot {
  id: number
  slug: string
  name: string
  description?: string
  telegram_url?: string
  thumbnail_url?: string
  category_slug?: string
  tags?: string[]
  click_count: number
  is_featured: boolean
  status: ContentStatus
  indexing_status: IndexingStatus
  published_at?: string
  quality_score: number
  seo_title?: string
  seo_description?: string
  created_at: string
  updated_at: string
}

export interface AITool {
  id: number
  slug: string
  name: string
  tagline?: string
  description?: string
  thumbnail_url?: string
  website_url?: string
  affiliate_url?: string
  category?: string
  payment_types?: string[]
  price_monthly?: number
  is_free: boolean
  is_featured: boolean
  upvote_count: number
  sort_order: number
  status: ContentStatus
  seo_title?: string
  seo_description?: string
  created_at: string
}

export interface Article {
  id: number
  slug: string
  title: string
  excerpt?: string
  content?: string
  cover_image_url?: string
  author: string
  read_time_min: number
  tags?: string[]
  is_published: boolean
  published_at?: string
  seo_title?: string
  seo_description?: string
  created_at: string
  updated_at: string
}

export interface TopList {
  id: number
  slug: string
  title: string
  description?: string
  category_slug?: string
  seo_title?: string
  seo_description?: string
}
