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

const CATEGORIES = [
  { slug: 'amateur',       label: 'Amateur'       },
  { slug: 'anal',          label: 'Anal'          },
  { slug: 'anime',         label: 'Anime'         },
  { slug: 'asian',         label: 'Asian'         },
  { slug: 'bdsm',          label: 'BDSM'          },
  { slug: 'big-ass',       label: 'Big Ass'       },
  { slug: 'big-tits',      label: 'Big Tits'      },
  { slug: 'blowjob',       label: 'Blowjob'       },
  { slug: 'cosplay',       label: 'Cosplay'       },
  { slug: 'creampie',      label: 'Creampie'      },
  { slug: 'cuckold',       label: 'Cuckold'       },
  { slug: 'ebony',         label: 'Ebony'         },
  { slug: 'feet',          label: 'Feet'          },
  { slug: 'fetish',        label: 'Fetish'        },
  { slug: 'latina',        label: 'Latina'        },
  { slug: 'lesbian',       label: 'Lesbian'       },
  { slug: 'milf',          label: 'MILF'          },
  { slug: 'nsfw-telegram', label: 'NSFW Telegram' },
  { slug: 'onlyfans',      label: 'OnlyFans'      },
  { slug: 'threesome',     label: 'Threesome'     },
  { slug: 'usa',           label: 'USA'           },
]

export default async function GroupsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; sort?: string; page?: string }>
}) {
  const params = await searchParams
  const page   = Number(params.page ?? 1)

  const { groups, total, totalPages } = await getGroups({
    category:   params.category,
    search:     params.search,
    sort:       (params.sort as 'newest' | 'popular' | 'members') ?? 'newest',
    page,
    entityType: ['group', 'channel'],
  })

  return (
    <main className="px-3 sm:px-6 py-8 max-w-7xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-black text-[#f5f5f5] mb-2">
        NSFW Telegram <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Groups</span>
      </h1>
      <p className="text-[#999] text-sm mb-6">
        {total > 0 ? `${fmt(total)} communities` : 'Browse all communities'}
      </p>

      <GroupsFilters categories={CATEGORIES} />

      {groups.length === 0 ? (
        <div className="text-center py-20 text-[#999]">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-base">No groups found. Try adjusting your filters.</p>
        </div>
      ) : (
        /* Original grid: grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 */
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mt-6">
          {groups.map(g => (
            <GroupCard
              key={g.id}
              href={`/${g.slug}`}
              title={g.name}
              category={cap(g.category_slug)}
              image={g.thumbnail_url}
              count={g.member_count}
              viewCount={g.view_count}
              isNew={g.is_new}
              isFeatured={g.is_featured}
              ctaLabel="🚀 Join"
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
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
    <Link href={href} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
      active
        ? 'bg-blue-600 text-white border border-blue-600'
        : 'bg-[#1a1a1a] text-[#999] border border-white/10 hover:border-white/20'
    }`}>
      {children}
    </Link>
  )
}
