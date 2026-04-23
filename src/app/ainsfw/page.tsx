import type { Metadata } from 'next'
import { getGroups } from '@/lib/supabase/queries/groups'
import { cap } from '@/lib/utils/seo'
import { AIToolCard } from '@/components/AIToolCard'

export const metadata: Metadata = {
  title: 'Best AI NSFW Tools — Adult AI Companions & Generators 2026',
  description: 'Curated directory of the best AI-powered adult tools. AI Companion apps, AI Girlfriend platforms, Undress AI generators, NSFW chatbots, and roleplay experiences.',
}

export default async function AINSFWPage() {
  const { groups, total } = await getGroups({
    category: 'ai-nsfw',
    sort: 'popular',
  })

  return (
    <main className="px-3 sm:px-6 py-8 max-w-7xl mx-auto">

      {/* Header — exact match to erogram.pro /ainsfw */}
      <div className="text-center mb-10">
        {/* Blue badge — "Curated & Reviewed" */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600/15 border border-blue-500/25 text-blue-300 text-xs font-bold uppercase tracking-widest mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          Curated &amp; Reviewed
        </div>

        {/* H1 with gradient — from-blue-400 via-sky-400 to-emerald-400 */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
          Best{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-400 to-emerald-400">
            AI NSFW
          </span>{' '}
          Tools
        </h1>

        <p className="text-white/40 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Curated directory of the best AI-powered adult tools in 2026. AI Companion apps,
          AI Girlfriend platforms, Undress AI generators, NSFW chatbots, AI image creators,
          and roleplay experiences.
        </p>

        {total > 0 && (
          <p className="text-[#999] text-sm mt-3">{total} tools available</p>
        )}
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-20 text-[#999]">
          <p className="text-4xl mb-4">✨</p>
          <p className="text-base">No AI tools found — check your Supabase connection and seed data.</p>
        </div>
      ) : (
        /* Original grid: grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {groups.map(tool => (
            <AIToolCard
              key={tool.id}
              href={`/${tool.slug}`}
              title={tool.name}
              category={cap(tool.category_slug)}
              image={tool.thumbnail_url}
              isNew={tool.is_new}
            />
          ))}
        </div>
      )}
    </main>
  )
}
