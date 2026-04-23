import type { Metadata } from 'next'
import Link from 'next/link'
import { getGroups } from '@/lib/supabase/queries/groups'
import { fmt, cap } from '@/lib/utils/seo'
import { GroupsFilters } from './GroupsFilters'
import { GroupCard } from '@/components/GroupCard'

export const metadata: Metadata = {
  title: 'NSFW Telegram Groups — Browse All',
  description: 'Browse and discover thousands of porn and NSFW Telegram groups by category.',
}

// slug matches DB category_slug exactly; label is display name
const CATEGORIES = [
  { slug: 'amateur',      label: 'Amateur'      },
  { slug: 'anal',         label: 'Anal'         },
  { slug: 'anime',        label: 'Anime'        },
  { slug: 'asian',        label: 'Asian'        },
  { slug: 'bdsm',         label: 'BDSM'         },
  { slug: 'big-ass',      label: 'Big Ass'      },
  { slug: 'big-tits',     label: 'Big Tits'     },
  { slug: 'blowjob',      label: 'Blowjob'      },
  { slug: 'cosplay',      label: 'Cosplay'      },
  { slug: 'creampie',     label: 'Creampie'     },
  { slug: 'cuckold',      label: 'Cuckold'      },
  { slug: 'ebony',        label: 'Ebony'        },
  { slug: 'feet',         label: 'Feet'         },
  { slug: 'fetish',       label: 'Fetish'       },
  { slug: 'latina',       label: 'Latina'       },
  { slug: 'lesbian',      label: 'Lesbian'      },
  { slug: 'milf',         label: 'MILF'         },
  { slug: 'nsfw-telegram',label: 'NSFW Telegram'},
  { slug: 'onlyfans',     label: 'OnlyFans'     },
  { slug: 'threesome',    label: 'Threesome'    },
  { slug: 'usa',          label: 'USA'          },
]

export default async function GroupsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; sort?: string; page?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page ?? 1)

  const { groups, total, totalPages } = await getGroups({
    category:   params.category,
    search:     params.search,
    sort:       (params.sort as 'newest' | 'popular' | 'members') ?? 'newest',
    page,
    entityType: ['group', 'channel'],  // Bug fix: exclude bots from groups page
  })

  return (
    <main style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ fontSize: 32, fontWeight: 900, color: '#f5f5f5', marginBottom: 6 }}>
        NSFW Telegram <span style={{ color: '#b31b1b' }}>Groups</span>
      </h1>
      <p style={{ color: '#999', fontSize: 14, marginBottom: 28 }}>
        {total > 0 ? `${fmt(total)} communities` : 'Browse all communities'}
      </p>

      <GroupsFilters categories={CATEGORIES} />

      {groups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#999' }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>🔍</p>
          <p style={{ fontSize: 16 }}>No groups found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="fresh-grid" style={{ marginTop: 24 }}>
          {groups.map(g => (
            <GroupCard
              key={g.id}
              href={`/${g.slug}`}
              title={g.name}
              category={cap(g.category_slug)}
              image={g.thumbnail_url}
              count={g.member_count}
              isNew={g.is_new}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 48 }}>
          {page > 1 && (
            <PaginationLink href={buildHref(params, page - 1)}>← Prev</PaginationLink>
          )}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
            return (
              <PaginationLink key={p} href={buildHref(params, p)} active={p === page}>
                {p}
              </PaginationLink>
            )
          })}
          {page < totalPages && (
            <PaginationLink href={buildHref(params, page + 1)}>Next →</PaginationLink>
          )}
        </div>
      )}
    </main>
  )
}

function buildHref(params: Record<string, string | undefined>, page: number) {
  const q = new URLSearchParams()
  if (params.category) q.set('category', params.category)
  if (params.search)   q.set('search',   params.search)
  if (params.sort)     q.set('sort',     params.sort)
  if (page > 1)        q.set('page',     String(page))
  const qs = q.toString()
  return `/groups${qs ? `?${qs}` : ''}`
}

function PaginationLink({ href, children, active }: {
  href: string; children: React.ReactNode; active?: boolean
}) {
  return (
    <Link href={href} style={{
      padding: '8px 14px', borderRadius: 8,
      background: active ? '#b31b1b' : '#1a1a1a',
      border: `1px solid ${active ? '#b31b1b' : 'rgba(255,255,255,0.08)'}`,
      color: active ? '#fff' : '#999',
      fontSize: 14, fontWeight: active ? 700 : 400,
      textDecoration: 'none',
    }}>
      {children}
    </Link>
  )
}
