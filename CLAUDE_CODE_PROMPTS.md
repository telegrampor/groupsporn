# PROMPTS CLAUDE CODE — nsfw-directory
# Cole cada FASE separadamente. Espere confirmar antes de avançar.
# Pasta do projeto: C:\nsfw-directory (NUNCA dentro de canais18)
# ================================================================


# ════════════════════════════════════════════════════════════════
# FASE 1 — SETUP INICIAL
# Cole este bloco inteiro no Claude Code
# ════════════════════════════════════════════════════════════════

Você vai criar do zero um novo projeto Next.js 15 chamado nsfw-directory.
Este projeto é 100% separado de qualquer outro projeto existente.
Pasta: C:\nsfw-directory

Execute estes comandos na ordem exata:

```
cd C:\
npx create-next-app@latest nsfw-directory --typescript --tailwind --app --src-dir --import-alias "@/*" --no-git
cd nsfw-directory
npm install @supabase/supabase-js @supabase/ssr lucide-react
npm install -D @types/node
```

Após instalar, crie esta estrutura de pastas:

```
mkdir src\app\groups\page
mkdir src\app\groups\page\[page]
mkdir src\app\bots
mkdir src\app\best-telegram-groups\[category]
mkdir src\app\articles\[slug]
mkdir src\app\ainsfw
mkdir src\app\onlyfanssearch
mkdir src\app\add
mkdir src\app\[slug]
mkdir src\app\api\join\[slug]
mkdir src\components\layout
mkdir src\components\groups
mkdir src\components\bots
mkdir src\components\home
mkdir src\components\ui
mkdir src\lib\supabase\queries
mkdir src\lib\utils
mkdir src\types
mkdir supabase\migrations
mkdir scripts\ingestion
mkdir scripts\utils
mkdir scripts\health
mkdir credentials
mkdir logs
mkdir public\assets
```

Depois crie os seguintes arquivos:

**Arquivo: .env.local**
```
NEXT_PUBLIC_SUPABASE_URL=PREENCHER
NEXT_PUBLIC_SUPABASE_ANON_KEY=PREENCHER
SUPABASE_SERVICE_ROLE_KEY=PREENCHER
NEXT_PUBLIC_SITE_URL=https://SEUDOMAIN.com
NEXT_PUBLIC_SITE_NAME=TeleNSFW
NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-XXXX.r2.dev
ANTHROPIC_API_KEY=PREENCHER
```

**Arquivo: next.config.ts**
```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.r2.dev' },
      { protocol: 'https', hostname: 'thumbs.onlyfans.com' },
      { protocol: 'https', hostname: 'public.onlyfans.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
    ],
  },
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Robots-Tag', value: 'index, follow' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
      ],
    }]
  },
}

export default nextConfig
```

**Arquivo: middleware.ts** (na raiz, não dentro de src)
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  // Age gate: sinaliza para o client component exibir o modal
  const ageConfirmed = request.cookies.get('age_confirmed')
  if (!ageConfirmed) {
    response.headers.set('x-age-gate', 'required')
  }
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
```

**Arquivo: src/app/globals.css**
```css
@import "tailwindcss";

:root {
  --bg-primary:    #0d0d0f;
  --bg-secondary:  #141417;
  --bg-card:       #1a1a1f;
  --border:        #2a2a32;
  --accent:        #e8356d;
  --accent-hover:  #c42d5e;
  --accent-gold:   #f59e0b;
  --text-primary:  #f0f0f5;
  --text-secondary:#9898aa;
  --text-muted:    #5a5a6e;
  --badge-new:     #22c55e;
  --badge-featured:#8b5cf6;
  --badge-premium: #f59e0b;
  --radius-sm:     6px;
  --radius-md:     10px;
  --radius-lg:     16px;
}

* { box-sizing: border-box; }

body {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Inter', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--bg-secondary); }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }
```

**Arquivo: src/types/database.ts**
```typescript
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
```

**Arquivo: src/lib/supabase/client.ts**
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Arquivo: src/lib/supabase/server.ts**
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

**Arquivo: src/lib/supabase/queries/groups.ts**
```typescript
import { createClient } from '@/lib/supabase/server'
import type { Group } from '@/types/database'

const PAGE_SIZE = 20
const PUBLISHED = ['published', 'submitted', 'indexed']

export interface GroupFilters {
  category?: string
  country?: string
  search?: string
  sort?: 'newest' | 'popular' | 'members'
  page?: number
}

export async function getGroups(filters: GroupFilters = {}) {
  const supabase = await createClient()
  const { category, country, search, sort = 'newest', page = 1 } = filters
  const offset = (page - 1) * PAGE_SIZE

  let query = supabase
    .from('groups')
    .select('*', { count: 'exact' })
    .in('indexing_status', PUBLISHED)
    .eq('hidden', false)
    .eq('status', 'active')

  if (category) query = query.eq('category_slug', category)
  if (country)  query = query.ilike('country', country)
  if (search)   query = query.textSearch('name', search, { type: 'websearch' })

  switch (sort) {
    case 'popular': query = query.order('click_count', { ascending: false }); break
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
  const supabase = await createClient()
  const { data } = await supabase
    .from('groups')
    .select('slug, updated_at')
    .in('indexing_status', PUBLISHED)
    .eq('hidden', false)
  return data ?? []
}
```

**Arquivo: src/lib/utils/seo.ts**
```typescript
const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL  || 'https://example.com'
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'TeleNSFW'
const YEAR      = new Date().getFullYear()

export function buildGroupMeta(group: {
  name: string
  slug: string
  description?: string
  seo_title?: string
  seo_description?: string
  thumbnail_url?: string
  member_count: number
  entity_type: string
  category_slug: string
  country: string
}) {
  const members = group.member_count > 0
    ? ` — ${fmt(group.member_count)} Members` : ''
  const type = group.entity_type === 'channel' ? 'Channel' : 'Group'

  const title = group.seo_title
    ?? `${group.name} Telegram ${type}${members} | ${SITE_NAME} ${YEAR}`

  const description = group.seo_description
    ?? `Join ${group.name} on Telegram. ${group.description
        ? group.description.slice(0, 110) + '…'
        : `Best ${group.category_slug} Telegram groups on ${SITE_NAME}.`}`

  const canonical = `${SITE_URL}/${group.slug}`
  const ogImage   = group.thumbnail_url ?? `${SITE_URL}/og-default.jpg`

  return {
    title,
    description: description.slice(0, 160),
    metadataBase: new URL(SITE_URL),
    alternates:   { canonical },
    openGraph: {
      title, description, url: canonical, siteName: SITE_NAME,
      images: [{ url: ogImage, width: 1200, height: 630, alt: group.name }],
      type: 'website' as const,
    },
    twitter: { card: 'summary_large_image' as const, title, description, images: [ogImage] },
    robots: {
      index: true, follow: true,
      'max-snippet': -1, 'max-image-preview': 'large' as const,
    },
  }
}

export function webPageSchema(group: {
  name: string; slug: string; description?: string;
  seo_description?: string; thumbnail_url?: string;
  published_at?: string; updated_at: string; category_slug: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type':    'WebPage',
    name:        group.name,
    description: group.seo_description ?? group.description,
    url:        `${SITE_URL}/${group.slug}`,
    image:       group.thumbnail_url,
    datePublished: group.published_at,
    dateModified:  group.updated_at,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home',   item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Groups', item: `${SITE_URL}/groups` },
        { '@type': 'ListItem', position: 3, name: cap(group.category_slug),
          item: `${SITE_URL}/best-telegram-groups/${group.category_slug}` },
        { '@type': 'ListItem', position: 4, name: group.name },
      ],
    },
  }
}

export function faqSchema(groupName: string) {
  return {
    '@context': 'https://schema.org',
    '@type':    'FAQPage',
    mainEntity: [
      { '@type': 'Question',
        name: `Is the ${groupName} Telegram group verified?`,
        acceptedAnswer: { '@type': 'Answer',
          text: `Yes. ${groupName} is manually verified by our team.` } },
      { '@type': 'Question',
        name: `How do I join ${groupName}?`,
        acceptedAnswer: { '@type': 'Answer',
          text: 'Click "Join Channel Now". You will be redirected to Telegram instantly.' } },
      { '@type': 'Question',
        name: 'Is it free?',
        acceptedAnswer: { '@type': 'Answer',
          text: 'Most groups are free. Some premium communities may require a Telegram subscription.' } },
    ],
  }
}

export const fmt = (n: number) =>
  n >= 1_000_000 ? `${(n/1_000_000).toFixed(1)}M`
  : n >= 1_000   ? `${(n/1_000).toFixed(1)}K`
  : String(n)

export const cap = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ')
```

Confirme com: `npm run build` e me mostre se há erros.


# ════════════════════════════════════════════════════════════════
# FASE 2 — PÁGINAS SSR
# Cole após a Fase 1 estar sem erros de build
# ════════════════════════════════════════════════════════════════

Implemente as páginas SSR do projeto nsfw-directory em C:\nsfw-directory.
Todas as páginas são Server Components. Zero "Loading..." para o Googlebot.

**Arquivo: src/app/layout.tsx**
```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL  || 'https://example.com'
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'TeleNSFW'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:  `${SITE_NAME} — Best NSFW Telegram Groups Directory`,
    template: `%s | ${SITE_NAME}`,
  },
  description: `Discover the best NSFW Telegram groups, channels, and bots. Verified and updated daily.`,
  openGraph: { siteName: SITE_NAME, type: 'website' },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <header style={{
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            height: 56 }}>
            <a href="/" style={{ color: 'var(--accent)', fontWeight: 800,
              fontSize: 20, textDecoration: 'none', letterSpacing: '-0.5px' }}>
              🔞 {SITE_NAME}
            </a>
            <nav style={{ display: 'flex', gap: 24, fontSize: 14 }}>
              {[
                ['Groups', '/groups'],
                ['Bots', '/bots'],
                ['AI Tools', '/ainsfw'],
                ['Articles', '/articles'],
              ].map(([label, href]) => (
                <a key={href} href={href} style={{
                  color: 'var(--text-secondary)', textDecoration: 'none',
                  transition: 'color 0.15s',
                }}
                onMouseOver={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseOut={e  => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                  {label}
                </a>
              ))}
            </nav>
          </div>
        </header>
        <div style={{ minHeight: 'calc(100vh - 56px)' }}>
          {children}
        </div>
        <footer style={{
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border)',
          padding: '32px 16px', marginTop: 64,
          textAlign: 'center', color: 'var(--text-muted)', fontSize: 13,
        }}>
          <p>© {new Date().getFullYear()} {SITE_NAME}. For adults 18+ only.</p>
          <p style={{ marginTop: 8 }}>
            <a href="/groups" style={{ color: 'var(--text-muted)', margin: '0 12px' }}>Groups</a>
            <a href="/bots"   style={{ color: 'var(--text-muted)', margin: '0 12px' }}>Bots</a>
            <a href="/articles" style={{ color: 'var(--text-muted)', margin: '0 12px' }}>Articles</a>
            <a href="/add"    style={{ color: 'var(--text-muted)', margin: '0 12px' }}>Submit</a>
          </p>
        </footer>
      </body>
    </html>
  )
}
```

**Arquivo: src/app/robots.ts**
```typescript
import { MetadataRoute } from 'next'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/admin/'] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
```

**Arquivo: src/app/sitemap.ts**
```typescript
import { MetadataRoute } from 'next'
import { getAllPublishedSlugs } from '@/lib/supabase/queries/groups'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getAllPublishedSlugs()

  const static_routes: MetadataRoute.Sitemap = [
    { url: SITE_URL,                              lastModified: new Date(), changeFrequency: 'daily',  priority: 1.0 },
    { url: `${SITE_URL}/groups`,                  lastModified: new Date(), changeFrequency: 'daily',  priority: 0.9 },
    { url: `${SITE_URL}/bots`,                    lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/ainsfw`,                  lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/articles`,                lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/best-telegram-groups`,    lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  ]

  const group_routes: MetadataRoute.Sitemap = slugs.map(g => ({
    url:             `${SITE_URL}/${g.slug}`,
    lastModified:    new Date(g.updated_at),
    changeFrequency: 'weekly',
    priority:        0.7,
  }))

  return [...static_routes, ...group_routes]
}
```

**Arquivo: src/app/page.tsx** (Home — SSR)
```typescript
import { getFreshGroups } from '@/lib/supabase/queries/groups'
import { fmt, cap } from '@/lib/utils/seo'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'TeleNSFW'
const YEAR = new Date().getFullYear()

export const metadata: Metadata = {
  title: `${SITE_NAME} — Best NSFW Telegram Groups & Channels Directory ${YEAR}`,
  description: `Discover ${YEAR}'s best NSFW Telegram groups, channels, and bots. Verified, updated daily. Browse thousands of communities.`,
}

const TOP_CATEGORIES = [
  'amateur','milf','lesbian','threesome','anal','onlyfans',
  'bdsm','cosplay','fetish','anime','asian','latina',
]

export default async function HomePage() {
  const fresh = await getFreshGroups(8)

  return (
    <main>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(180deg, #1a0a10 0%, var(--bg-primary) 100%)',
        padding: '64px 16px 48px', textAlign: 'center',
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: 900,
            lineHeight: 1.15, color: 'var(--text-primary)', marginBottom: 16 }}>
            The #1 NSFW Telegram<br />
            <span style={{ color: 'var(--accent)' }}>Groups Directory</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 32 }}>
            Discover verified Telegram groups, bots & AI tools.<br />
            Updated daily. Browse thousands of communities.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/groups" style={{
              background: 'var(--accent)', color: '#fff', padding: '12px 28px',
              borderRadius: 'var(--radius-md)', fontWeight: 700, textDecoration: 'none',
              fontSize: 15,
            }}>Explore Groups</Link>
            <Link href="/bots" style={{
              background: 'var(--bg-card)', color: 'var(--text-primary)',
              border: '1px solid var(--border)', padding: '12px 28px',
              borderRadius: 'var(--radius-md)', fontWeight: 600, textDecoration: 'none',
              fontSize: 15,
            }}>Explore Bots</Link>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>

        {/* Fresh Additions */}
        {fresh.length > 0 && (
          <section style={{ marginTop: 48 }}>
            <div style={{ display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>🔥 Fresh New Additions</h2>
              <Link href="/groups" style={{ color: 'var(--accent)', fontSize: 13,
                textDecoration: 'none' }}>View all →</Link>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 12,
            }}>
              {fresh.map(g => (
                <Link key={g.id} href={`/${g.slug}`} style={{
                  display: 'block', background: 'var(--bg-card)',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                  overflow: 'hidden', textDecoration: 'none',
                  transition: 'border-color 0.15s',
                }}>
                  <div style={{ position: 'relative', aspectRatio: '16/9',
                    background: 'var(--bg-secondary)' }}>
                    {g.thumbnail_url && (
                      <Image src={g.thumbnail_url} alt={g.name} fill
                        sizes="200px" style={{ objectFit: 'cover' }} />
                    )}
                    {g.is_new && (
                      <span style={{
                        position: 'absolute', top: 6, left: 6,
                        background: 'var(--badge-new)', color: '#fff',
                        fontSize: 10, fontWeight: 700, padding: '2px 6px',
                        borderRadius: 4,
                      }}>NEW</span>
                    )}
                  </div>
                  <div style={{ padding: '10px 12px' }}>
                    <p style={{ fontWeight: 600, fontSize: 13,
                      color: 'var(--text-primary)', marginBottom: 4,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {g.name}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {cap(g.category_slug)}
                      {g.member_count > 0 && ` · ${fmt(g.member_count)}`}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Curated Top Lists */}
        <section style={{ marginTop: 56 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
            📂 Browse by Category
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 10,
          }}>
            {TOP_CATEGORIES.map(cat => (
              <Link key={cat} href={`/best-telegram-groups/${cat}`} style={{
                display: 'block', background: 'var(--bg-card)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                padding: '14px 16px', textDecoration: 'none',
                transition: 'border-color 0.15s',
              }}>
                <p style={{ fontWeight: 600, fontSize: 14,
                  color: 'var(--text-primary)', marginBottom: 2 }}>
                  {cap(cat)}
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Top 10 Collections
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ com schema */}
        <section style={{ marginTop: 64, maxWidth: 720 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
            Frequently Asked Questions
          </h2>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org', '@type': 'FAQPage',
            mainEntity: [
              { '@type': 'Question', name: `What is ${SITE_NAME}?`,
                acceptedAnswer: { '@type': 'Answer',
                  text: `${SITE_NAME} is a curated directory of NSFW Telegram groups, channels, and bots. All communities are verified and updated daily.` }},
              { '@type': 'Question', name: 'How do I join a Telegram group?',
                acceptedAnswer: { '@type': 'Answer',
                  text: 'Click any group card and press the Join button. You will be redirected to Telegram to join instantly.' }},
              { '@type': 'Question', name: 'Is this site free?',
                acceptedAnswer: { '@type': 'Answer',
                  text: `Yes. ${SITE_NAME} is completely free to browse. No account required.` }},
            ],
          })}} />
          {[
            [`What is ${SITE_NAME}?`,
             `${SITE_NAME} is a curated directory of NSFW Telegram groups, channels, and bots. All communities are verified and updated daily.`],
            ['How do I join a Telegram group?',
             'Click any group card and press the Join button. You will be redirected to Telegram to join instantly.'],
            ['Is this site free?',
             `Yes. ${SITE_NAME} is completely free to browse. No account required.`],
          ].map(([q, a]) => (
            <details key={q} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', marginBottom: 8,
            }}>
              <summary style={{
                padding: '14px 16px', cursor: 'pointer', fontWeight: 500,
                color: 'var(--text-primary)', listStyle: 'none',
              }}>{q}</summary>
              <p style={{ padding: '0 16px 14px', color: 'var(--text-secondary)',
                fontSize: 14, lineHeight: 1.6 }}>{a}</p>
            </details>
          ))}
        </section>

      </div>
    </main>
  )
}
```

**Arquivo: src/app/[slug]/page.tsx** (Group Detail — SSR CRÍTICO)
```typescript
import { notFound }     from 'next/navigation'
import { Metadata }     from 'next'
import Image            from 'next/image'
import Link             from 'next/link'
import { getGroupBySlug, getSimilarGroups, getAllPublishedSlugs } from '@/lib/supabase/queries/groups'
import { buildGroupMeta, webPageSchema, faqSchema, fmt, cap } from '@/lib/utils/seo'

export async function generateStaticParams() {
  const slugs = await getAllPublishedSlugs()
  return slugs.map(g => ({ slug: g.slug }))
}

export const revalidate = 86400  // ISR: revalida a cada 24h

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const group = await getGroupBySlug(slug)
  if (!group) return { title: 'Not Found', robots: { index: false } }
  return buildGroupMeta(group)
}

export default async function GroupDetailPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const group = await getGroupBySlug(slug)
  if (!group) notFound()

  const similar = await getSimilarGroups(group.category_slug, slug)
  const type    = group.entity_type === 'channel' ? 'Channel' : 'Group'
  const members = group.member_count > 0 ? fmt(group.member_count) : null

  return (
    <>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema(group)) }} />
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(group.name)) }} />

      <main style={{ minHeight: '100vh' }}>

        {/* Banner blur */}
        <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
          {group.thumbnail_url && (
            <Image src={group.thumbnail_url} alt="" fill priority
              sizes="100vw"
              style={{ objectFit: 'cover', filter: 'blur(20px)',
                opacity: 0.2, transform: 'scale(1.1)' }} />
          )}
          <div style={{ position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, transparent, var(--bg-primary))' }} />
        </div>

        <div style={{ maxWidth: 800, margin: '-48px auto 0', padding: '0 16px 64px' }}>

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" style={{
            display: 'flex', flexWrap: 'wrap', gap: 6,
            fontSize: 12, color: 'var(--text-muted)', marginBottom: 20,
          }}>
            {[
              ['Home', '/'],
              ['Groups', '/groups'],
              [cap(group.category_slug), `/best-telegram-groups/${group.category_slug}`],
            ].map(([label, href]) => (
              <>
                <Link key={href} href={href}
                  style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                  {label}
                </Link>
                <span>/</span>
              </>
            ))}
            <span style={{ color: 'var(--text-secondary)' }}>{group.name}</span>
          </nav>

          {/* Card principal */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{
              position: 'relative', width: 88, height: 88, flexShrink: 0,
              borderRadius: 16, overflow: 'hidden',
              border: '1px solid var(--border)', background: 'var(--bg-card)',
            }}>
              {group.thumbnail_url ? (
                <Image src={group.thumbnail_url} alt={group.name}
                  fill sizes="88px" style={{ objectFit: 'cover' }} priority />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center',
                  justifyContent: 'center', height: '100%', fontSize: 32 }}>📢</div>
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                {group.is_verified && (
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#22c55e' }}>
                    ✓ Verified
                  </span>
                )}
                {group.is_new && (
                  <span style={{
                    background: 'var(--badge-new)', color: '#fff',
                    fontSize: 10, fontWeight: 700, padding: '2px 8px',
                    borderRadius: 999,
                  }}>NEW</span>
                )}
                {group.is_featured && (
                  <span style={{
                    background: 'var(--badge-featured)', color: '#fff',
                    fontSize: 10, fontWeight: 700, padding: '2px 8px',
                    borderRadius: 999,
                  }}>⭐ FEATURED</span>
                )}
              </div>

              {/* H1 — keyword principal */}
              <h1 style={{
                fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 800,
                color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: 10,
              }}>
                {group.name}
              </h1>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16,
                fontSize: 13, color: 'var(--text-secondary)' }}>
                <Link href={`/best-telegram-groups/${group.category_slug}`}
                  style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
                  #{cap(group.category_slug)}
                </Link>
                {group.country && group.country !== 'All' && (
                  <span>🌍 {group.country}</span>
                )}
                {members && <span>👥 {members} members</span>}
              </div>
            </div>
          </div>

          {/* Descrição expandida */}
          {(group.seo_description || group.description) && (
            <div style={{
              marginTop: 20, padding: 16, borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7,
            }}>
              <p>{group.seo_description || group.description}</p>
            </div>
          )}

          {/* CTA Join */}
          <div style={{
            marginTop: 24, padding: '24px 20px', borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            textAlign: 'center',
          }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>
              Click below to access this {type.toLowerCase()} on Telegram.
            </p>
            <a href={`/api/join/${group.slug}`}
              rel="nofollow noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'var(--accent)', color: '#fff',
                padding: '14px 36px', borderRadius: 'var(--radius-md)',
                fontWeight: 700, fontSize: 16, textDecoration: 'none',
                boxShadow: '0 0 30px rgba(232,53,109,0.3)',
              }}>
              🚀 Join {type} Now
            </a>
          </div>

          {/* Similar groups */}
          {similar.length > 0 && (
            <section style={{ marginTop: 40 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700,
                marginBottom: 14, color: 'var(--text-primary)' }}>
                Similar Communities
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: 10,
              }}>
                {similar.map(s => (
                  <Link key={s.id} href={`/${s.slug}`} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: 12, borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    textDecoration: 'none',
                  }}>
                    <div style={{
                      position: 'relative', width: 36, height: 36,
                      borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                      background: 'var(--bg-secondary)',
                    }}>
                      {s.thumbnail_url && (
                        <Image src={s.thumbnail_url} alt={s.name}
                          fill sizes="36px" style={{ objectFit: 'cover' }}
                          loading="lazy" />
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{
                        fontSize: 12, fontWeight: 600, color: 'var(--text-primary)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{s.name}</p>
                      {s.member_count > 0 && (
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {fmt(s.member_count)}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* FAQ */}
          <section style={{ marginTop: 40 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700,
              marginBottom: 14, color: 'var(--text-primary)' }}>
              Frequently Asked Questions
            </h2>
            {[
              [`Is ${group.name} verified?`,
               `Yes. ${group.name} is manually verified to be active and match its description.`],
              [`How do I join ${group.name}?`,
               'Click "Join Channel Now" above. You will be redirected to Telegram instantly.'],
              ['Is it free?',
               'Most groups are free. Some communities may require a Telegram subscription.'],
              [`What category is ${group.name}?`,
               `${group.name} is listed under ${cap(group.category_slug)}.${group.country && group.country !== 'All' ? ` Origin: ${group.country}.` : ''}`],
            ].map(([q, a]) => (
              <details key={q} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', marginBottom: 6,
              }}>
                <summary style={{
                  padding: '13px 16px', cursor: 'pointer',
                  fontWeight: 500, fontSize: 14, color: 'var(--text-primary)',
                  listStyle: 'none',
                }}>{q}</summary>
                <p style={{ padding: '0 16px 13px',
                  color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>
                  {a}
                </p>
              </details>
            ))}
          </section>

        </div>
      </main>
    </>
  )
}
```

**Arquivo: src/app/api/join/[slug]/route.ts**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase  = await createClient()

  const { data } = await supabase
    .from('groups')
    .select('telegram_url, click_count')
    .eq('slug', slug)
    .single()

  if (!data?.telegram_url) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Incrementa click (non-blocking)
  supabase.rpc('increment_group_click', { group_slug: slug }).then(() => {})

  return NextResponse.redirect(data.telegram_url, { status: 302 })
}
```

Após criar todos os arquivos, rode:
```
npm run build
```

E valide o SSR com:
```
curl -s http://localhost:3000/SLUG-DE-TESTE | findstr /I "<h1"
```

Se retornar o HTML com o título (não "Loading..."), o SSR está funcionando.
Confirme o output do build antes de avançar para a Fase 3.


# ════════════════════════════════════════════════════════════════
# FASE 3 — SCRIPTS PYTHON (Anti-Falhas)
# Cole após a Fase 2 estar com build sem erros
# ════════════════════════════════════════════════════════════════

No projeto C:\nsfw-directory, crie os scripts Python do sistema anti-falhas.

Primeiro, crie o arquivo scripts/requirements.txt:
```
supabase==2.10.0
anthropic==0.40.0
google-api-python-client==2.155.0
google-auth==2.36.0
python-dotenv==1.0.1
```

Instale as dependências:
```
cd C:\nsfw-directory
pip install -r scripts/requirements.txt
```

Agora crie exatamente estes 5 arquivos Python (já validados com `python -m py_compile`):

**Arquivo: scripts/utils/__init__.py** (vazio)
```python
```

**Arquivo: scripts/utils/logger.py**
[CONTEÚDO COMPLETO DO logger.py ENTREGUE ANTERIORMENTE — copiar do arquivo]

**Arquivo: scripts/utils/db_validator.py**
[CONTEÚDO COMPLETO DO db_validator.py ENTREGUE ANTERIORMENTE — copiar do arquivo]

**Arquivo: scripts/health_check.py**
[CONTEÚDO COMPLETO DO health_check.py ENTREGUE ANTERIORMENTE — copiar do arquivo]

**Arquivo: scripts/ingestion/daily_publish.py**
[CONTEÚDO COMPLETO DO daily_publish.py ENTREGUE ANTERIORMENTE — copiar do arquivo]

**Arquivo: scripts/ingestion/ai_content_generator.py**
[CONTEÚDO COMPLETO DO ai_content_generator.py ENTREGUE ANTERIORMENTE — copiar do arquivo]

Após criar os arquivos, valide a sintaxe:
```
cd C:\nsfw-directory
python -m py_compile scripts/utils/logger.py && echo OK: logger
python -m py_compile scripts/utils/db_validator.py && echo OK: db_validator
python -m py_compile scripts/health_check.py && echo OK: health_check
python -m py_compile scripts/ingestion/daily_publish.py && echo OK: daily_publish
python -m py_compile scripts/ingestion/ai_content_generator.py && echo OK: ai_content_generator
```

Todos devem retornar "OK". Se algum falhar, mostre o erro completo.


# ════════════════════════════════════════════════════════════════
# FASE 4 — SQL + VALIDAÇÃO FINAL
# Cole no Claude Code após a Fase 3 estar OK
# ════════════════════════════════════════════════════════════════

Execute o SQL de migração no Supabase e valide o projeto completo.

**1. Crie o arquivo supabase/migrations/001_initial_schema.sql**
[CONTEÚDO COMPLETO DO SQL ENTREGUE ANTERIORMENTE]

**2. Crie o arquivo DEPLOY_CHECKLIST.md:**
```markdown
# Deploy Checklist — nsfw-directory

## PRÉ-DEPLOY
- [ ] Criar projeto Supabase NOVO (separado do canais18)
- [ ] Rodar 001_initial_schema.sql no SQL Editor do Supabase
- [ ] Criar bucket R2 no Cloudflare (público)
- [ ] Preencher .env.local com todas as variáveis
- [ ] `npm run build` → zero erros

## VALIDAÇÃO SSR (obrigatório antes de lançar)
- [ ] `npm run dev` → abrir http://localhost:3000
- [ ] Inspecionar View Source de uma página de grupo
- [ ] Confirmar: <h1> está no HTML (não gerado por JS)
- [ ] Confirmar: <title> está no HTML
- [ ] Confirmar: application/ld+json está no HTML
- [ ] `curl http://localhost:3000/SLUG | findstr "<h1"` retorna resultado

## SANDBOX (primeiros 50 grupos)
- [ ] Inserir 50 grupos manualmente com indexing_status='queued'
- [ ] `python scripts/ingestion/ai_content_generator.py`
- [ ] `python scripts/health_check.py` → confirmar 0 grupos sem seo_description
- [ ] `python scripts/ingestion/daily_publish.py`
- [ ] `python scripts/health_check.py` → confirmar 50 como 'submitted'
- [ ] Aguardar 24-48h → verificar Search Console

## DEPLOY VERCEL
- [ ] `git init && git add . && git commit -m "initial"`
- [ ] Criar repo no GitHub (NOVO, separado do canais18)
- [ ] Conectar no Vercel
- [ ] Adicionar env vars no Vercel dashboard
- [ ] Configurar domínio
- [ ] Testar: `curl https://DOMINIO/SLUG | grep "<h1"`

## PRODUÇÃO (após sandbox validado)
- [ ] Configurar Windows Task Scheduler:
      daily_publish.py → 16:30 UTC diário
      ai_content_generator.py → 08:00 UTC diário
      health_check.py → 09:00 UTC diário (log de saúde)
- [ ] Submeter sitemap.xml no Google Search Console
- [ ] Monitorar Core Web Vitals no PageSpeed Insights

## KPIs
Mês 1: 50 páginas indexadas, CWV verde
Mês 2: 3.000 páginas, primeiros rankings EN
Mês 3: 50k visitas/mês
Mês 4: 150k visitas/mês
Mês 5: 300k visitas/mês
Mês 6: 500k visitas/mês
```

**3. Validação final completa:**
```
cd C:\nsfw-directory
npm run build
npm run dev
```

Em outro terminal:
```
curl -s http://localhost:3000 | findstr /I "TeleNSFW"
```

Deve retornar o título do site no HTML.

Confirme com o output completo do `npm run build`.
