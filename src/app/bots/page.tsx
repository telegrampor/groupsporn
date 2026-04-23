import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getGroups } from '@/lib/supabase/queries/groups'
import { fmt, cap } from '@/lib/utils/seo'

export const metadata: Metadata = {
  title: 'NSFW Telegram Bots — AI Companions & Tools',
  description: 'Discover the best NSFW Telegram bots, AI companions, and adult tools. Verified and updated daily.',
}

export default async function BotsPage() {
  const { groups: bots, total } = await getGroups({ sort: 'popular' })
  const filtered = bots.filter(g => g.entity_type === 'bot')

  return (
    <main style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ fontSize: 36, fontWeight: 900, color: '#f0f0f5', marginBottom: 8 }}>
          NSFW Telegram <span style={{ color: '#e8356d' }}>Bots</span>
        </h1>
        <p style={{ color: '#9898aa', fontSize: 14 }}>
          AI companions, NSFW chatbots, and interactive adult tools
        </p>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#9898aa' }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>🤖</p>
          <p style={{ fontSize: 16, marginBottom: 8 }}>Bots coming soon.</p>
          <p style={{ fontSize: 14 }}>
            Meanwhile, browse our{' '}
            <Link href="/groups" style={{ color: '#0ea5e9', textDecoration: 'none' }}>Telegram Groups</Link>
          </p>
        </div>
      ) : (
        <div className="fresh-grid">
          {filtered.map(bot => (
            <Link key={bot.id} href={`/${bot.slug}`} className="card-hover" style={{
              display: 'block', position: 'relative',
              aspectRatio: '1 / 1', borderRadius: 12,
              overflow: 'hidden', background: '#141417',
              textDecoration: 'none', border: '1px solid #2a2a32',
            }}>
              {bot.thumbnail_url ? (
                <Image src={bot.thumbnail_url} alt={bot.name} fill sizes="(max-width:640px) 50vw, 25vw" style={{ objectFit: 'cover' }} />
              ) : (
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#1a1a2e,#2d1b69)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 40 }}>🤖</span>
                </div>
              )}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.85) 0%,transparent 55%)' }} />
              <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>
                  {bot.name}
                </p>
                <p style={{ fontSize: 11, color: '#9898aa' }}>
                  {cap(bot.category_slug || 'bot')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
