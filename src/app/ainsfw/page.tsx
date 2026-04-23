import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getGroups } from '@/lib/supabase/queries/groups'
import { cap } from '@/lib/utils/seo'

export const metadata: Metadata = {
  title: 'AI NSFW Tools — Best Adult AI Companions & Generators',
  description: 'Discover the best AI NSFW tools, adult AI companions, and image generators. Updated daily.',
}

export default async function AINSFWPage() {
  const { groups } = await getGroups({ category: 'ai-nsfw', sort: 'popular' })

  return (
    <main style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{
        textAlign: 'center', marginBottom: 48,
        background: 'radial-gradient(ellipse at 50% 0%,rgba(232,53,109,0.12) 0%,transparent 60%)',
        padding: '48px 0 0',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(232,53,109,0.1)', border: '1px solid rgba(232,53,109,0.3)',
          borderRadius: 999, padding: '5px 14px', fontSize: 12, color: '#e8356d', fontWeight: 600, marginBottom: 16,
        }}>
          🔞 Adults Only
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 900, color: '#f0f0f5', marginBottom: 8 }}>
          AI NSFW <span style={{ color: '#e8356d' }}>Tools</span>
        </h1>
        <p style={{ color: '#9898aa', fontSize: 14, maxWidth: 480, margin: '0 auto' }}>
          AI companions, NSFW image generators, adult chatbots and more.
          All tools are verified and for adults 18+ only.
        </p>
      </div>

      {groups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#9898aa' }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>✨</p>
          <p style={{ fontSize: 16, marginBottom: 8 }}>AI NSFW tools coming soon.</p>
          <p style={{ fontSize: 14 }}>
            Meanwhile, browse our{' '}
            <Link href="/groups" style={{ color: '#0ea5e9', textDecoration: 'none' }}>Telegram Groups</Link>
          </p>
        </div>
      ) : (
        <div className="fresh-grid">
          {groups.map(tool => (
            <Link key={tool.id} href={`/${tool.slug}`} className="card-hover" style={{
              display: 'block', position: 'relative',
              aspectRatio: '1 / 1', borderRadius: 12,
              overflow: 'hidden', background: '#141417',
              textDecoration: 'none', border: '1px solid #2a2a32',
            }}>
              {tool.thumbnail_url ? (
                <Image src={tool.thumbnail_url} alt={tool.name} fill sizes="(max-width:640px) 50vw, 25vw" style={{ objectFit: 'cover' }} />
              ) : (
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#1a0a1e,#3d1069)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 40 }}>✨</span>
                </div>
              )}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.85) 0%,transparent 55%)' }} />
              <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>
                  {tool.name}
                </p>
                <p style={{ fontSize: 11, color: '#9898aa' }}>{cap(tool.category_slug)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
