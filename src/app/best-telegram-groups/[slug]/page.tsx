import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getGroups } from '@/lib/supabase/queries/groups'
import { fmt, cap } from '@/lib/utils/seo'
import { ChevronRight } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const label = cap(slug)
  return {
    title: `Best ${label} Telegram Groups — Top 10 Collections`,
    description: `Discover the best ${label} NSFW Telegram groups. Curated and verified top communities.`,
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { groups } = await getGroups({ category: slug, sort: 'members' })

  if (groups.length === 0) {
    return (
      <main style={{ padding: '48px 24px', maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#f0f0f5', marginBottom: 16 }}>
          Best <span style={{ color: '#e8356d' }}>{cap(slug)}</span> Groups
        </h1>
        <p style={{ color: '#9898aa' }}>No groups found in this category yet. Check back soon.</p>
        <Link href="/best-telegram-groups" style={{ display: 'inline-block', marginTop: 24, color: '#e8356d', textDecoration: 'none' }}>
          ← All Categories
        </Link>
      </main>
    )
  }

  return (
    <main style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Breadcrumb */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#5a5a6e', marginBottom: 28 }}>
        <Link href="/" style={{ color: '#9898aa', textDecoration: 'none' }}>Home</Link>
        <ChevronRight size={12} />
        <Link href="/best-telegram-groups" style={{ color: '#9898aa', textDecoration: 'none' }}>Top Lists</Link>
        <ChevronRight size={12} />
        <span style={{ color: '#f0f0f5' }}>{cap(slug)}</span>
      </nav>

      <h1 style={{ fontSize: 36, fontWeight: 900, color: '#f0f0f5', marginBottom: 8 }}>
        Best <span style={{ color: '#e8356d' }}>{cap(slug)}</span> Telegram Groups
      </h1>
      <p style={{ color: '#9898aa', fontSize: 14, marginBottom: 36 }}>
        Top {groups.length} curated {cap(slug)} communities — verified and updated daily
      </p>

      <div className="fresh-grid">
        {groups.map((g, i) => (
          <Link key={g.id} href={`/${g.slug}`} className="card-hover" style={{
            display: 'block', position: 'relative',
            aspectRatio: '1 / 1', borderRadius: 12,
            overflow: 'hidden', background: '#141417',
            textDecoration: 'none', border: '1px solid #2a2a32',
          }}>
            {g.thumbnail_url ? (
              <Image src={g.thumbnail_url} alt={g.name} fill sizes="(max-width:640px) 50vw, 25vw" style={{ objectFit: 'cover' }} />
            ) : (
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#1a1a2e,#2d1b69)' }} />
            )}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.85) 0%,transparent 55%)' }} />
            <div style={{
              position: 'absolute', top: 8, left: 8,
              background: '#e8356d', color: '#fff',
              fontSize: 11, fontWeight: 800,
              width: 22, height: 22, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {i + 1}
            </div>
            <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>
                {g.name}
              </p>
              <p style={{ fontSize: 11, color: '#9898aa' }}>
                {g.member_count > 0 ? fmt(g.member_count) + ' members' : cap(g.category_slug)}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: 40, textAlign: 'center' }}>
        <Link href="/groups" style={{
          display: 'inline-block', background: '#e8356d', color: '#fff',
          padding: '12px 28px', borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: 'none',
        }}>
          Browse All Groups →
        </Link>
      </div>
    </main>
  )
}
