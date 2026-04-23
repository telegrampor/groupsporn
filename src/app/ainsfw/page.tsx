import type { Metadata } from 'next'
import { getGroups } from '@/lib/supabase/queries/groups'
import { cap } from '@/lib/utils/seo'
import { GroupCard } from '@/components/GroupCard'

export const metadata: Metadata = {
  title: 'AI NSFW Tools — Best Adult AI Companions & Generators',
  description: 'Discover the best AI NSFW tools, adult AI companions, and image generators. Updated daily.',
}

export default async function AINSFWPage() {
  // category_slug='ai-nsfw' covers both entity_type='channel' (ai_tools)
  // and entity_type='group' (Telegram AI groups) — no type mismatch
  const { groups, total } = await getGroups({
    category: 'ai-nsfw',
    sort: 'popular',
  })

  return (
    <main style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{
        textAlign: 'center', marginBottom: 48,
        background: 'radial-gradient(ellipse at 50% 0%, rgba(179,27,27,0.1) 0%, transparent 60%)',
        padding: '48px 0 0',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(179,27,27,0.1)', border: '1px solid rgba(179,27,27,0.3)',
          borderRadius: 999, padding: '5px 14px',
          fontSize: 12, color: '#b31b1b', fontWeight: 600, marginBottom: 16,
        }}>
          🔞 Adults Only
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 900, color: '#f5f5f5', marginBottom: 8 }}>
          AI NSFW <span style={{ color: '#b31b1b' }}>Tools</span>
        </h1>
        <p style={{ color: '#999', fontSize: 14, maxWidth: 480, margin: '0 auto' }}>
          {total > 0
            ? `${total} AI companions, image generators, adult chatbots and more`
            : 'AI companions, NSFW image generators, adult chatbots and more'}
        </p>
      </div>

      {groups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#999' }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>✨</p>
          <p style={{ fontSize: 16 }}>No AI tools found — check your Supabase connection and seed data.</p>
        </div>
      ) : (
        <div className="fresh-grid">
          {groups.map(tool => (
            <GroupCard
              key={tool.id}
              href={`/${tool.slug}`}
              title={tool.name}
              category={cap(tool.category_slug)}
              image={tool.thumbnail_url}
              count={tool.member_count || undefined}
              isNew={tool.is_new}
            />
          ))}
        </div>
      )}
    </main>
  )
}
