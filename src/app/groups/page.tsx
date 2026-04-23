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
  'Amateur','Anal','Anime','Asian','BDSM','Big Ass','Big Tits','Blowjob',
  'Cosplay','Ebony','Feet','Fetish','Latina','Lesbian','MILF','Onlyfans',
  'Threesome','AI NSFW','Cuckold','Creampie',
]

export default async function GroupsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; sort?: string; page?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page ?? 1)
  const { groups, total, totalPages } = await getGroups({
    category: params.category,
    search: params.search,
    sort: (params.sort as 'newest' | 'popular' | 'members') ?? 'newest',
    page,
  })

  return (
    <main style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ fontSize: 32, fontWeight: 900, color: '#f0f0f5', marginBottom: 6 }}>
        NSFW Telegram <span style={{ color: '#e8356d' }}>Groups</span>
      </h1>
      <p style={{ color: '#9898aa', fontSize: 14, marginBottom: 28 }}>
        {total > 0 ? `${fmt(total)} communities` : 'Browse all communities'}
      </p>

      <GroupsFilters categories={CATEGORIES} />

      {groups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#9898aa' }}>
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

      {/* Pagination */}
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

function PaginationLink({ href, children, active }: { href: string; children: React.ReactNode; active?: boolean }) {
  return (
    <Link href={href} style={{
      padding: '8px 14px', borderRadius: 8,
      background: active ? '#e8356d' : '#141417',
      border: `1px solid ${active ? '#e8356d' : '#2a2a32'}`,
      color: active ? '#fff' : '#9898aa',
      fontSize: 14, fontWeight: active ? 700 : 400,
      textDecoration: 'none',
    }}>
      {children}
    </Link>
  )
}
