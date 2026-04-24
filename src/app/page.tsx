import { getFreshGroups } from '@/lib/supabase/queries/groups'
import { fmt, cap } from '@/lib/utils/seo'
import { createClient } from '@supabase/supabase-js'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { Article } from '@/types/database'

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'GroupsPorn'
const YEAR      = new Date().getFullYear()

export const metadata: Metadata = {
  title: `${SITE_NAME} — #1 NSFW Telegram Groups, Bots & OnlyFans Directory ${YEAR}`,
  description: `Your #1 hub for NSFW Telegram groups & bots, AI companions & tools, and 1.8M+ OnlyFans creators.`,
}

function isConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !!url && /^https?:\/\//.test(url) && !!key && key !== 'PREENCHER'
}

async function getLatestArticles(limit = 6): Promise<Article[]> {
  if (!isConfigured()) return []
  try {
    const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const { data } = await s.from('articles')
      .select('id, slug, title, excerpt, cover_image_url, author, published_at, read_time_min')
      .eq('is_published', true).order('published_at', { ascending: false }).limit(limit)
    return (data ?? []) as Article[]
  } catch { return [] }
}

const TOP_CATEGORIES = [
  { slug: 'amateur',  label: 'Best Amateur Groups',   icon: '🔥' },
  { slug: 'anime',    label: 'Best Anime Groups',      icon: '🎌' },
  { slug: 'onlyfans', label: 'Best OnlyFans Groups',   icon: '💎' },
  { slug: 'asian',    label: 'Best Asian Groups',      icon: '🌏' },
  { slug: 'anal',     label: 'Best Anal Groups',       icon: '🍑' },
  { slug: 'fetish',   label: 'Best Fetish Groups',     icon: '⛓️' },
  { slug: 'lesbian',  label: 'Best Lesbian Groups',    icon: '🌈' },
  { slug: 'milf',     label: 'Best MILF Groups',       icon: '👑' },
  { slug: 'bdsm',     label: 'Best BDSM Groups',       icon: '🔞' },
  { slug: 'cosplay',  label: 'Best Cosplay Groups',    icon: '🎭' },
  { slug: 'latina',   label: 'Best Latina Groups',     icon: '💃' },
  { slug: 'blowjob',  label: 'Best Blowjob Groups',   icon: '💋' },
]

const FAQ: [string, string][] = [
  [`What is ${SITE_NAME}?`,
   `${SITE_NAME} is the #1 curated directory for NSFW Telegram groups, bots, AI tools, and 1.8M+ OnlyFans creators. All communities are verified and updated daily.`],
  ['How do I join a Telegram group?',
   'Click any group card and tap "Join". You will be redirected to Telegram instantly. Make sure the Telegram app is installed on your device.'],
  ['Is this site free?',
   `Yes. ${SITE_NAME} is 100% free to browse. No account or payment required.`],
  ['How are groups verified?',
   'Our team manually reviews each submission for authenticity and content quality before publishing. Groups are re-checked regularly.'],
  ['What is the OnlyFans Search feature?',
   'The OnlyFans Search gives you access to over 1.8 million OnlyFans creator profiles. Search by name, username, or category.'],
  ['Can I submit my Telegram group?',
   'Yes! Click "+ Add" in the navbar. Your submission is reviewed and published within 24–48 hours if it meets our guidelines.'],
  ['What AI NSFW tools are listed?',
   `${SITE_NAME} indexes AI companions, NSFW image generators, AI chatbots, and other adult AI tools. All verified and updated daily.`],
  ['Is it safe?',
   `${SITE_NAME} only lists publicly available Telegram groups. We do not collect personal data. All redirects use official Telegram links. Adults 18+ only.`],
]

export default async function HomePage() {
  const [fresh, articles] = await Promise.all([getFreshGroups(8), getLatestArticles(6)])

  return (
    <div className="min-h-screen bg-[#111111] overflow-hidden">

      {/* ═══ HERO ═══════════════════════════════════════════ */}
      <section className="relative">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-[#ff0000]/10 to-transparent rounded-full blur-[100px] opacity-30 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-28 pb-20">
          <div className="text-center max-w-4xl mx-auto">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-white/10 bg-white/5 mb-4 sm:mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span className="text-white/60 text-xs sm:text-sm font-medium">
                The #1 NSFW &amp; Porn Telegram and AI Directory
              </span>
            </div>

            {/* H1 */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black mb-4 sm:mb-8 leading-tight tracking-tight">
              <span className="text-[#f5f5f5]">Discover NSFW &amp; Porn<br />Telegram groups, </span>
              <span className="gradient-text">bots &amp; AI</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-xl md:text-2xl text-[#999] mb-6 sm:mb-10 max-w-3xl mx-auto px-4 leading-relaxed">
              Your #1 hub for NSFW Telegram groups &amp; bots, AI companions &amp; tools,
              and 1.8M+ OnlyFans creators. Explore and save your favorites all in one place.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-2.5 md:gap-4 justify-center items-center w-full mb-6 sm:mb-8">
              <Link href="/#groups"
                className="flex-1 sm:flex-initial sm:w-auto flex items-center justify-center gap-1.5 md:gap-2.5 px-4 py-2.5 md:px-8 md:py-4 bg-[#0088cc] border border-[#0088cc] text-white hover:bg-[#009dd9] rounded-lg md:rounded-xl text-[14px] md:text-lg font-semibold transition-all hover:scale-105 whitespace-nowrap">
                📢 Explore Groups
              </Link>
              <Link href="/bots"
                className="flex-1 sm:flex-initial sm:w-auto flex items-center justify-center gap-1.5 md:gap-2.5 px-4 py-2.5 md:px-8 md:py-4 bg-[#0088cc] border border-[#0088cc] text-white hover:bg-[#009dd9] rounded-lg md:rounded-xl text-[14px] md:text-lg font-semibold transition-all hover:scale-105 whitespace-nowrap">
                🤖 Explore Bots
              </Link>
              <Link href="/ainsfw"
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 md:gap-2.5 px-4 py-2.5 md:px-8 md:py-4 bg-[#0088cc] border border-[#0088cc] text-white hover:bg-[#009dd9] rounded-lg md:rounded-xl text-[14px] md:text-lg font-semibold transition-all hover:scale-105 whitespace-nowrap">
                🔞 Explore AI NSFW
              </Link>
              <Link href="/onlyfanssearch"
                className="relative w-full sm:w-auto px-4 py-2.5 sm:px-5 md:px-8 md:py-4 bg-[#00AFF0] hover:bg-[#009dd9] text-white rounded-lg md:rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-1.5 md:gap-2.5 whitespace-nowrap font-semibold text-[14px] md:text-lg">
                🔍 ONLYFANS SEARCH
                <span className="text-xs opacity-80 font-normal hidden sm:inline">+1.8M creators</span>
              </Link>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 max-w-4xl mx-auto">
              {[
                { value: '+5K',       label: 'Groups',           pulse: false },
                { value: '0',         label: 'Visiting Now',     pulse: true  },
                { value: '4,981,220', label: 'Total Views',      pulse: true  },
                { value: '+1.8M',     label: 'OnlyFans Creators',pulse: false },
              ].map(stat => (
                <div key={stat.label}
                  className="glass rounded-xl sm:rounded-2xl px-3 py-3 sm:p-5 text-center hover-glow transition-all duration-300 border-white/5 bg-white/[0.02]">
                  <p className="text-[17px] sm:text-2xl md:text-3xl font-bold text-white mb-0.5 tracking-tight leading-tight">
                    {stat.value}
                  </p>
                  <p className="text-white/40 text-[10px] sm:text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5">
                    {stat.pulse && (
                      <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-red-500" />
                      </span>
                    )}
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ═══ FRESH NEW ADDITIONS ════════════════════════════ */}
      {fresh.length > 0 && (
        <section id="groups" className="mt-20 sm:mt-40 max-w-7xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 text-[#f5f5f5]">
            Fresh <span className="gradient-text">New Additions</span>
          </h2>
          <p className="text-center text-[#999] text-sm mb-12 sm:mb-16 max-w-xl mx-auto">
            The latest groups added to {SITE_NAME} — updated daily
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {fresh.map(g => (
              <Link key={g.id} href={`/${g.slug}`}
                className="block glass rounded-2xl overflow-hidden border border-white/5 hover:border-[#b31b1b]/50 transition-all duration-300 hover:scale-[1.03] group">
                <div className="aspect-square relative overflow-hidden bg-[#1a1a1a]">
                  {g.thumbnail_url ? (
                    <Image src={g.thumbnail_url} alt={g.name} fill
                      sizes="(max-width:640px) 50vw, 25vw"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#2d1b69]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  {g.is_new && (
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 rounded-full bg-[#b31b1b]/90 text-white text-[10px] font-bold uppercase tracking-wide">New</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-bold text-sm leading-tight line-clamp-2 drop-shadow-lg">{g.name}</p>
                  </div>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <span className="text-[10px] text-[#999] font-medium uppercase tracking-wide truncate">
                    {cap(g.category_slug)}
                  </span>
                  {g.member_count > 0 && (
                    <span className="text-[10px] text-[#999] flex items-center gap-1 shrink-0">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                      </svg>
                      {fmt(g.member_count)}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10 sm:mt-14">
            <Link href="/groups"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#b31b1b] hover:bg-[#d32f2f] text-white rounded-lg text-lg font-semibold transition-all hover:scale-105">
              Browse All Groups →
            </Link>
          </div>
        </section>
      )}

      {/* ═══ CURATED TOP LISTS ══════════════════════════════ */}
      <section className="mt-20 sm:mt-40 max-w-7xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 sm:mb-16 text-[#f5f5f5]">
          Curated <span className="gradient-text">Top Lists</span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TOP_CATEGORIES.map(cat => (
            <Link key={cat.slug} href={`/best-telegram-groups/${cat.slug}`}
              className="glass p-4 rounded-xl border border-white/5 hover:border-[#b31b1b] transition-all hover:scale-105 text-center group">
              <p className="text-2xl mb-2">{cat.icon}</p>
              <p className="text-sm font-bold text-[#f5f5f5] group-hover:text-[#b31b1b] transition-colors leading-tight">
                {cat.label}
              </p>
              <p className="text-xs text-[#999] mt-1">Top 10 Collections</p>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/best-telegram-groups" className="text-[#b31b1b] hover:underline text-sm font-medium">
            View all categories →
          </Link>
        </div>
      </section>

      {/* ═══ LATEST ARTICLES ════════════════════════════════ */}
      {articles.length > 0 && (
        <section id="articles" className="mt-20 sm:mt-40 max-w-7xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 sm:mb-16 text-[#f5f5f5]">
            Latest <span className="gradient-text">Articles</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map(article => (
              <Link key={article.id} href={`/articles/${article.slug}`}
                className="glass rounded-2xl overflow-hidden hover-glow block group">
                <div className="aspect-video overflow-hidden relative bg-[#1a1a1a]">
                  {article.cover_image_url && (
                    <Image src={article.cover_image_url} alt={article.title} fill
                      sizes="(max-width:768px) 100vw, 400px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  )}
                </div>
                <div className="p-6">
                  <p className="text-xl font-bold mb-3 text-[#f5f5f5] clamp-2">{article.title}</p>
                  {article.excerpt && (
                    <p className="text-[#999] text-sm mb-4 clamp-3">{article.excerpt}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-[#999]">
                    <span>By {article.author || SITE_NAME}</span>
                    {article.published_at && (
                      <span>{new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/articles"
              className="px-6 py-3 bg-[#b31b1b] hover-glow text-white rounded-lg text-lg font-semibold transition-all hover:scale-105 inline-block">
              View All Articles →
            </Link>
          </div>
        </section>
      )}

      {/* ═══ FAQ ════════════════════════════════════════════ */}
      <section id="faq" className="mt-20 sm:mt-40 max-w-4xl mx-auto px-4 pb-20 sm:pb-40">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 sm:mb-16 text-[#f5f5f5]">
          Frequently Asked <span className="gradient-text">Questions</span>
        </h2>

        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org', '@type': 'FAQPage',
            mainEntity: FAQ.map(([q, a]) => ({
              '@type': 'Question', name: q,
              acceptedAnswer: { '@type': 'Answer', text: a },
            })),
          }),
        }} />

        <div className="flex flex-col gap-4">
          {FAQ.map(([q, a]) => (
            <div key={q} className="glass rounded-2xl p-6 hover-glow faq-item">
              <p className="text-lg sm:text-xl font-bold mb-3 text-[#f5f5f5]">{q}</p>
              <p className="text-[#999] text-sm sm:text-base leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
