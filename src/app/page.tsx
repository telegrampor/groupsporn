import { getFreshGroups } from '@/lib/supabase/queries/groups'
import { fmt, cap } from '@/lib/utils/seo'
import { createClient } from '@supabase/supabase-js'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { Article } from '@/types/database'
import { Send, Lock, Sparkles, Search, ChevronRight } from 'lucide-react'

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'EROgram'
const YEAR = new Date().getFullYear()

export const metadata: Metadata = {
  title: `${SITE_NAME} — #1 NSFW Telegram Groups, Bots & OnlyFans Directory ${YEAR}`,
  description: `Your #1 hub for NSFW Telegram groups & bots, AI companions & tools, and 1.8M+ OnlyFans creators. Explore and save your favorites all in one place.`,
}

function isConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !!url && /^https?:\/\//.test(url) && !!key && key !== 'PREENCHER'
}

async function getLatestArticles(limit = 3): Promise<Article[]> {
  if (!isConfigured()) return []
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    const { data } = await supabase
      .from('articles')
      .select('id, slug, title, excerpt, cover_image_url, author, published_at, read_time_min')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(limit)
    return (data ?? []) as Article[]
  } catch {
    return []
  }
}

const TOP_CATEGORIES = [
  { slug: 'amateur',  label: 'Best Amateur Groups'  },
  { slug: 'anime',    label: 'Best Anime Groups'     },
  { slug: 'onlyfans', label: 'Best Onlyfans Groups'  },
  { slug: 'asian',    label: 'Best Asian Groups'     },
  { slug: 'anal',     label: 'Best Anal Groups'      },
  { slug: 'roleplay', label: 'Best Roleplay Groups'  },
  { slug: 'fetish',   label: 'Best Fetish Groups'    },
  { slug: 'lesbian',  label: 'Best Lesbian Groups'   },
  { slug: 'milf',     label: 'Best MILF Groups'      },
  { slug: 'bdsm',     label: 'Best BDSM Groups'      },
  { slug: 'cosplay',  label: 'Best Cosplay Groups'   },
]

const FAQ: [string, string][] = [
  [`What is ${SITE_NAME}?`,
   `${SITE_NAME} is the #1 curated directory for NSFW Telegram groups, channels, bots, AI tools, and 1.8M+ OnlyFans creators. All communities are verified and updated daily.`],
  ['How do I join a Telegram group from this directory?',
   'Click any group card and tap "Join". You will be redirected to Telegram instantly. The Telegram app must be installed on your device.'],
  ['Is this site free to use?',
   `Yes. ${SITE_NAME} is 100% free to browse. No account, registration, or payment required.`],
  ['How are groups verified?',
   'Our team manually reviews each submission for authenticity, activity, and content quality before publishing. Groups are re-checked regularly.'],
  [`What is the OnlyFans Search feature?`,
   'The OnlyFans Search gives you access to over 1.8 million OnlyFans creator profiles. Search by name, username, or category to find creators you love.'],
  ['Can I submit my Telegram group or channel?',
   'Yes. Click "+Add" in the navbar. Your submission will be reviewed and published within 24–48 hours if it meets our content guidelines.'],
  ['What AI NSFW tools are listed?',
   `${SITE_NAME} indexes AI companions, NSFW image generators, AI chatbots, and other adult AI tools. Browse the AI NSFW section to discover the best tools available.`],
  ['Is it safe and private to use this directory?',
   `${SITE_NAME} only lists publicly available Telegram groups. We do not collect personal data. All redirects use official Telegram links. This site is intended for adults 18+ only.`],
]

export default async function HomePage() {
  const [fresh, articles] = await Promise.all([
    getFreshGroups(8),
    getLatestArticles(3),
  ])

  return (
    <main>

      {/* ═══════════════════════════════════════
          HERO + STATS
      ═══════════════════════════════════════ */}
      <section style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(232,53,109,0.15) 0%, transparent 60%)',
        padding: '80px 24px 60px',
        textAlign: 'center',
      }}>

        {/* Hero content */}
        <div style={{ maxWidth: 700, margin: '0 auto 48px' }}>

          {/* Animated badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 9,
            border: '1px solid #2a2a32', borderRadius: 999,
            padding: '6px 14px', fontSize: 13, color: '#9898aa',
            marginBottom: 24, background: 'rgba(20,20,23,0.7)',
          }}>
            <span className="pulse-dot-red" />
            The #1 NSFW &amp; Porn Telegram and AI Directory
          </div>

          {/* H1 */}
          <h1 style={{
            fontSize: 56, fontWeight: 900, lineHeight: 1.1,
            color: '#f0f0f5', maxWidth: 700,
            margin: '0 auto 16px', letterSpacing: '-1.5px',
          }}>
            Discover NSFW &amp; Porn<br />
            Telegram groups,{' '}
            <span style={{ color: '#e8356d' }}>bots &amp; AI</span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 16, color: '#9898aa', lineHeight: 1.6,
            maxWidth: 500, margin: '0 auto 36px',
          }}>
            Your #1 hub for NSFW Telegram groups &amp; bots, AI companions &amp; tools,
            and 1.8M+ OnlyFans creators. Explore and save your favorites all in one place.
          </p>

          {/* 4 CTAs */}
          <div className="hero-ctas">
            <Link href="/groups" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#0ea5e9', color: '#fff', padding: '12px 20px',
              borderRadius: 8, fontWeight: 600, fontSize: 14,
              textDecoration: 'none', whiteSpace: 'nowrap',
            }}>
              <Send size={15} /> Explore Groups
            </Link>
            <Link href="/bots" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#0ea5e9', color: '#fff', padding: '12px 20px',
              borderRadius: 8, fontWeight: 600, fontSize: 14,
              textDecoration: 'none', whiteSpace: 'nowrap',
            }}>
              <Lock size={15} /> Explore Bots
            </Link>
            <Link href="/ainsfw" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#e8356d', color: '#fff', padding: '12px 20px',
              borderRadius: 8, fontWeight: 600, fontSize: 14,
              textDecoration: 'none', whiteSpace: 'nowrap',
            }}>
              <Sparkles size={15} /> Explore AI NSFW
            </Link>
            <Link href="/ofsearch" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#0ea5e9', color: '#fff', padding: '12px 20px',
              borderRadius: 8, fontWeight: 600, fontSize: 14,
              textDecoration: 'none', whiteSpace: 'nowrap',
            }}>
              <Search size={15} />
              ONLYFANS SEARCH
              <span style={{ fontSize: 11, opacity: 0.8, fontWeight: 500 }}>+1.8M creators</span>
            </Link>
          </div>

        </div>

        {/* Stats bar */}
        <div className="hero-stats" style={{ maxWidth: 800, margin: '0 auto' }}>
          <StatCard value="+5K"       label="Groups" />
          <StatCard value="0"         label="Visiting Now"     pulse />
          <StatCard value="4,981,220" label="Views"            pulse />
          <StatCard value="+1.8M"     label="OnlyFans Creators" />
        </div>

      </section>

      {/* ═══════════════════════════════════════
          FRESH NEW ADDITIONS
      ═══════════════════════════════════════ */}
      {fresh.length > 0 && (
        <section style={{ padding: '64px 24px', textAlign: 'center' }}>

          <h2 style={{ fontSize: 40, fontWeight: 800, color: '#f0f0f5', marginBottom: 8 }}>
            Fresh{' '}
            <span style={{ color: '#e8356d' }}>New Additions</span>
          </h2>
          <p style={{ color: '#9898aa', fontSize: 14, marginBottom: 32 }}>
            The latest groups added to {SITE_NAME} — updated daily
          </p>

          <div className="fresh-grid" style={{ maxWidth: 1200, margin: '0 auto' }}>
            {fresh.map(g => (
              <Link key={g.id} href={`/${g.slug}`} className="card-hover" style={{
                display: 'block', position: 'relative',
                aspectRatio: '1 / 1', borderRadius: 12,
                overflow: 'hidden', background: '#141417',
                textDecoration: 'none', border: '1px solid #2a2a32',
              }}>
                {/* Image */}
                {g.thumbnail_url && (
                  <Image
                    src={g.thumbnail_url} alt={g.name} fill
                    sizes="(max-width: 640px) 50vw, (max-width: 900px) 33vw, 280px"
                    style={{ objectFit: 'cover' }}
                  />
                )}

                {/* Bottom gradient overlay */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
                }} />

                {/* NEW badge */}
                {g.is_new && (
                  <span style={{
                    position: 'absolute', top: 10, left: 10,
                    background: '#22c55e', color: '#fff',
                    fontSize: 10, fontWeight: 700,
                    padding: '3px 8px', borderRadius: 4,
                    textTransform: 'uppercase',
                  }}>New</span>
                )}

                {/* Name + category */}
                <div style={{
                  position: 'absolute', bottom: 12, left: 12, right: 12,
                  textAlign: 'left',
                }}>
                  <p style={{
                    fontSize: 14, fontWeight: 600, color: '#fff',
                    marginBottom: 2, overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{g.name}</p>
                  <p style={{ fontSize: 12, color: '#9898aa' }}>
                    {cap(g.category_slug)}
                    {g.member_count > 0 && ` · ${fmt(g.member_count)}`}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <Link href="/groups" style={{
            display: 'inline-block', marginTop: 32,
            background: '#e8356d', color: '#fff',
            padding: '12px 28px', borderRadius: 8,
            fontWeight: 600, fontSize: 14, textDecoration: 'none',
          }}>
            Browse All Groups
          </Link>

        </section>
      )}

      {/* ═══════════════════════════════════════
          CURATED TOP LISTS
      ═══════════════════════════════════════ */}
      <section style={{ padding: '64px 24px', textAlign: 'center' }}>

        <h2 style={{ fontSize: 40, fontWeight: 800, color: '#f0f0f5', marginBottom: 32 }}>
          Curated{' '}
          <span style={{ color: '#e8356d' }}>Top Lists</span>
        </h2>

        <div className="top-lists-grid" style={{ maxWidth: 1200, margin: '0 auto 20px' }}>
          {TOP_CATEGORIES.map(cat => (
            <Link
              key={cat.slug}
              href={`/best-telegram-groups/${cat.slug}`}
              className="card-hover"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: '#141417', border: '1px solid #2a2a32',
                borderRadius: 10, padding: '14px 16px',
                textDecoration: 'none', textAlign: 'left',
              }}
            >
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#f0f0f5', marginBottom: 2 }}>
                  {cat.label}
                </p>
                <p style={{ fontSize: 11, color: '#9898aa' }}>Top 10 Collections</p>
              </div>
              <ChevronRight size={14} style={{ color: '#9898aa', flexShrink: 0, marginLeft: 8 }} />
            </Link>
          ))}
        </div>

        <Link href="/best-telegram-groups" style={{
          color: '#e8356d', fontSize: 13, textDecoration: 'none',
        }}>
          View all categories →
        </Link>

      </section>

      {/* ═══════════════════════════════════════
          LATEST ARTICLES
      ═══════════════════════════════════════ */}
      {articles.length > 0 && (
        <section style={{ padding: '64px 24px', textAlign: 'center' }}>

          <h2 style={{ fontSize: 40, fontWeight: 800, color: '#f0f0f5', marginBottom: 32 }}>
            Latest{' '}
            <span style={{ color: '#e8356d' }}>Articles</span>
          </h2>

          <div className="articles-grid" style={{ maxWidth: 1200, margin: '0 auto' }}>
            {articles.map(article => (
              <Link key={article.id} href={`/articles/${article.slug}`}
                className="card-hover" style={{
                  display: 'block',
                  background: '#141417', border: '1px solid #2a2a32',
                  borderRadius: 12, overflow: 'hidden',
                  textDecoration: 'none', textAlign: 'left',
                }}>
                <div style={{ position: 'relative', height: 180, background: '#1a1a1f' }}>
                  {article.cover_image_url && (
                    <Image
                      src={article.cover_image_url} alt={article.title} fill
                      sizes="(max-width: 768px) 100vw, 380px"
                      style={{ objectFit: 'cover' }}
                    />
                  )}
                </div>
                <div style={{ padding: 16 }}>
                  <p className="clamp-2" style={{
                    fontSize: 15, fontWeight: 700, color: '#f0f0f5', marginBottom: 8,
                  }}>{article.title}</p>
                  {article.excerpt && (
                    <p className="clamp-2" style={{
                      fontSize: 13, color: '#9898aa', lineHeight: 1.5, marginBottom: 12,
                    }}>{article.excerpt}</p>
                  )}
                  <p style={{ fontSize: 12, color: '#5a5a6e' }}>
                    By {article.author || SITE_NAME}
                    {article.published_at && (
                      <> · {new Date(article.published_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}</>
                    )}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <Link href="/articles" style={{
            display: 'inline-block', marginTop: 32,
            border: '1px solid #2a2a32', color: '#f0f0f5',
            padding: '10px 24px', borderRadius: 8,
            fontWeight: 500, fontSize: 14, textDecoration: 'none',
          }}>
            View All Articles
          </Link>

        </section>
      )}

      {/* ═══════════════════════════════════════
          FAQ
      ═══════════════════════════════════════ */}
      <section style={{ padding: '64px 24px', textAlign: 'center' }}>

        <h2 style={{ fontSize: 40, fontWeight: 800, color: '#f0f0f5', marginBottom: 32 }}>
          Frequently Asked{' '}
          <span style={{ color: '#e8356d' }}>Questions</span>
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

        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'left' }}>
          {FAQ.map(([q, a]) => (
            <details key={q} style={{
              background: '#141417', border: '1px solid #2a2a32',
              borderRadius: 10, marginBottom: 8,
            }}>
              <summary style={{
                padding: '16px 20px', cursor: 'pointer',
                fontSize: 15, fontWeight: 500, color: '#f0f0f5',
                listStyle: 'none',
              }}>
                {q}
              </summary>
              <p style={{
                padding: '0 20px 16px', fontSize: 14,
                color: '#9898aa', lineHeight: 1.6,
              }}>
                {a}
              </p>
            </details>
          ))}
        </div>

      </section>

    </main>
  )
}

function StatCard({
  value, label, pulse = false,
}: {
  value: string
  label: string
  pulse?: boolean
}) {
  return (
    <div style={{
      background: '#141417', border: '1px solid #2a2a32',
      borderRadius: 12, padding: '20px 28px', textAlign: 'center',
    }}>
      <p style={{ fontSize: 32, fontWeight: 800, color: '#f0f0f5', marginBottom: 4 }}>
        {value}
      </p>
      <p style={{
        fontSize: 11, color: '#9898aa',
        textTransform: 'uppercase', letterSpacing: '1px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
        margin: 0,
      }}>
        {pulse && <span className="pulse-dot" />}
        {label}
      </p>
    </div>
  )
}
