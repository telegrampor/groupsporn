import type { Metadata } from 'next'
import { getGroups } from '@/lib/supabase/queries/groups'
import { cap } from '@/lib/utils/seo'
import { GroupCard } from '@/components/GroupCard'

export const metadata: Metadata = {
  title: 'NSFW Telegram Bots — AI Companions & Interactive Tools',
  description: 'Discover the best NSFW Telegram bots, AI companions, and adult chatbots. Verified and updated daily.',
}

export default async function BotsPage() {
  // entity_type='bot' filtered in DB — no JS-side filtering
  const { groups: bots, total } = await getGroups({
    entityType: 'bot',
    sort: 'popular',
  })

  return (
    <main style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ fontSize: 36, fontWeight: 900, color: '#f5f5f5', marginBottom: 8 }}>
          NSFW Telegram <span style={{ color: '#b31b1b' }}>Bots</span>
        </h1>
        <p style={{ color: '#999', fontSize: 14 }}>
          {total > 0
            ? `${total} AI companions, chatbots, and interactive adult tools`
            : 'AI companions, NSFW chatbots, and interactive adult tools'}
        </p>
      </div>

      {bots.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#999' }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>🤖</p>
          <p style={{ fontSize: 16 }}>No bots found — check your Supabase connection and seed data.</p>
        </div>
      ) : (
        <div className="fresh-grid">
          {bots.map(bot => (
            <GroupCard
              key={bot.id}
              href={`/${bot.slug}`}
              title={bot.name}
              category={cap(bot.category_slug || 'bot')}
              image={bot.thumbnail_url}
              count={bot.member_count}
              isNew={bot.is_new}
            />
          ))}
        </div>
      )}
    </main>
  )
}
