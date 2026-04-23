import type { Metadata } from 'next'
import { getGroups } from '@/lib/supabase/queries/groups'
import { cap } from '@/lib/utils/seo'
import { GroupCard } from '@/components/GroupCard'

export const metadata: Metadata = {
  title: 'NSFW Telegram Bots — AI Companions & Interactive Tools',
  description: 'Discover the best NSFW Telegram bots, AI companions, and adult chatbots. Verified and updated daily.',
}

export default async function BotsPage() {
  const { groups: bots, total } = await getGroups({
    entityType: 'bot',
    sort: 'popular',
  })

  return (
    <main className="px-3 sm:px-6 py-8 max-w-7xl mx-auto">

      {/* Header — matches erogram.pro /bots h1 exactly */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-[#f5f5f5] mb-4">
          Discover NSFW Telegram <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Bots</span>
        </h1>
        <p className="text-[#999] text-lg">
          {total > 0
            ? `${total} AI companions, chatbots, and interactive adult tools`
            : 'Discover amazing bots'}
        </p>
      </div>

      {bots.length === 0 ? (
        <div className="text-center py-20 text-[#999]">
          <p className="text-4xl mb-4">🤖</p>
          <p className="text-base">No bots found — check your Supabase connection and seed data.</p>
        </div>
      ) : (
        /* Original grid: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 relative z-10">
          {bots.map(bot => (
            <GroupCard
              key={bot.id}
              href={`/${bot.slug}`}
              title={bot.name}
              category={cap(bot.category_slug || 'bot')}
              image={bot.thumbnail_url}
              count={bot.member_count}
              viewCount={bot.view_count}
              isNew={bot.is_new}
              isFeatured={bot.is_featured}
              ctaLabel="🤖 Use Bot"
            />
          ))}
        </div>
      )}
    </main>
  )
}
