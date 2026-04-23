import { getFreshGroups } from '@/lib/supabase/queries/groups'
import { fmt, cap } from '@/lib/utils/seo'
import { createClient } from '@supabase/supabase-js'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { Article } from '@/types/database'
import { ChevronRight } from 'lucide-react'
import { Hero } from '@/components/Hero'

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'GroupsPorn'
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
   `${SITE_NAME} is the #1 curated directory for NSFW Telegram groups, bots, AI tools, and 1.8M+ OnlyFans creators. All communities are verified and updated daily.`],
  ['How do I join a Telegram group?',
   'Click any group card and tap "Join". You will be redirected to Telegram instantly. The Telegram app must be installed on your device.'],
  ['Is this site free?',
   `Yes. ${SITE_NAME} is 100% free to browse. No account or payment required.`],
  ['How are groups verified?',
   'Our team manually reviews each submission for authenticity and content quality before publishing. Groups are re-checked regularly.'],
  ['What is the OnlyFans Search feature?',
   'The OnlyFans Search gives you access to over 1.8 million OnlyFans creator profiles. Search by name, username, or category.'],
  ['Can I submit my Telegram group?',
   'Yes. Click "+Add" in the navbar. Your submission is reviewed and published within 24–48 hours if it meets our guidelines.'],
  ['What AI NSFW tools are listed?',
   `${SITE_NAME} indexes AI companions, NSFW image generators, AI chatbots, and other adult AI tools.`],
  ['Is it safe to use this directory?',
   `${SITE_NAME} only lists publicly available Telegram groups. We do not collect personal data. All redirects use official Telegram links. Adults 18+ only.`],
]

export default async function HomePage() {
  const [fresh, articles] = await Promise.all([
    getFreshGroups(8),
    getLatestArticles(3),
  ])

  return (
    <main>

      {/* ═══ HERO ═══ */}
      <Hero />

      {/* ═══ FRESH NEW ADDITIONS ═══ */}
      {fresh.length > 0 && (
        <section id="groups" style={{ padding: '64px 24px', textAlign: 'center' }}>

          <h2 className="section-title">
            Fresh <span style={{ color: '#e8356d' }}>New Additions</span>
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
                {g.thumbnail_url && (
                  <Image
                    src={g.thumbnail_url} alt={g.name} fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    style={{ objectFit: 'cover' }}
                  />
                )}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%)',
                }} />
                {g.is_new && (
                  <span style={{
                    position: 'absolute', top: 10, left: 10,
                    background: '#22c55e', color: '#fff',
                    fontSize: 10, fontWeight: 700,
                    padding: '3px 8px', borderRadius: 4,
                    textTransform: 'uppercase',
                  }}>New</span>
                )}
                <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, textAlign: 'left' }}>
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

          <Link href="/groups" className="browse-btn" style={{
            marginTop: 32,
            background: '#e8356d', color: '#fff',
            padding: '12px 28px', borderRadius: 8,
            fontWeight: 600, fontSize: 14, textDecoration: 'none',
          }}>
            Browse All Groups →
          </Link>

        </section>
      )}

      {/* ═══ CURATED TOP LISTS ═══ */}
      <section id="top-lists" style={{ padding: '64px 24px', textAlign: 'center' }}>

        <h2 className="section-title">
          Curated <span style={{ color: '#e8356d' }}>Top Lists</span>
        </h2>

        <div className="top-lists-grid" style={{ maxWidth: 1200, margin: '0 auto 20px' }}>
          {TOP_CATEGORIES.map(cat => (
            <Link
              key={cat.slug}
              href={`/best-telegram-groups/${cat.slug}`}
              className="card-hover tl-card"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: '#141417', border: '1px solid #2a2a32',
                borderRadius: 10, padding: '14px 16px',
                textDecoration: 'none', textAlign: 'left',
              }}
            >
              <div>
                <p className="tl-title" style={{ fontSize: 13, fontWeight: 600, color: '#f0f0f5', marginBottom: 2 }}>
                  {cat.label}
                </p>
                <p className="tl-sub" style={{ fontSize: 11, color: '#9898aa' }}>Top 10 Collections</p>
              </div>
              <ChevronRight className="tl-chevron" size={14} style={{ color: '#9898aa', flexShrink: 0, marginLeft: 8 }} />
            </Link>
          ))}
        </div>

        <Link href="/best-telegram-groups" style={{
          color: '#e8356d', fontSize: 13, textDecoration: 'none',
        }}>
          View all categories →
        </Link>

      </section>

      {/* ═══ LATEST ARTICLES ═══ */}
      {articles.length > 0 && (
        <section id="articles" style={{ padding: '64px 24px', textAlign: 'center' }}>

          <h2 className="section-title">
            Latest <span style={{ color: '#e8356d' }}>Articles</span>
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
                  <p className="clamp-2" style={{ fontSize: 15, fontWeight: 700, color: '#f0f0f5', marginBottom: 8 }}>
                    {article.title}
                  </p>
                  {article.excerpt && (
                    <p className="clamp-2" style={{ fontSize: 13, color: '#9898aa', lineHeight: 1.5, marginBottom: 12 }}>
                      {article.excerpt}
                    </p>
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

      {/* ═══ FAQ ═══ */}
      <section id="faq" style={{ padding: '64px 24px', textAlign: 'center' }}>

        <h2 className="section-title">
          Frequently Asked <span style={{ color: '#e8356d' }}>Questions</span>
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
            <details key={q} className="faq-item" style={{
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
              <p style={{ padding: '0 20px 16px', fontSize: 14, color: '#9898aa', lineHeight: 1.6 }}>
                {a}
              </p>
            </details>
          ))}
        </div>

      </section>

    </main>
  )
}
