import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getArticles } from '@/lib/supabase/queries/articles'

export const metadata: Metadata = {
  title: 'Articles & Guides — NSFW Telegram Community Insights',
  description: 'Read expert guides, community stories, and insights about NSFW Telegram groups.',
}

export default async function ArticlesPage() {
  const articles = await getArticles(24)

  return (
    <main style={{ padding: '48px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1 style={{ fontSize: 40, fontWeight: 900, color: '#f0f0f5', marginBottom: 8 }}>
          Latest <span style={{ color: '#e8356d' }}>Articles</span>
        </h1>
        <p style={{ color: '#9898aa', fontSize: 15 }}>
          Discover insights, guides, and stories about NSFW Telegram groups
        </p>
      </div>

      {articles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#9898aa' }}>
          <p style={{ fontSize: 16 }}>No articles yet. Check back soon.</p>
        </div>
      ) : (
        <div className="articles-grid">
          {articles.map(article => (
            <Link key={article.id} href={`/articles/${article.slug}`}
              className="card-hover" style={{
                display: 'block',
                background: '#141417', border: '1px solid #2a2a32',
                borderRadius: 12, overflow: 'hidden',
                textDecoration: 'none', textAlign: 'left',
              }}>
              <div style={{ position: 'relative', height: 200, background: '#1a1a1f' }}>
                {article.cover_image_url && (
                  <Image
                    src={article.cover_image_url} alt={article.title} fill
                    sizes="(max-width:768px) 100vw, 380px"
                    style={{ objectFit: 'cover' }}
                  />
                )}
              </div>
              <div style={{ padding: 16 }}>
                {article.tags && article.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                    {article.tags.slice(0, 3).map(tag => (
                      <span key={tag} style={{
                        fontSize: 10, fontWeight: 700, color: '#0ea5e9',
                        background: 'rgba(14,165,233,0.1)', padding: '2px 8px', borderRadius: 999,
                        textTransform: 'uppercase', letterSpacing: 0.5,
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <p className="clamp-2" style={{ fontSize: 15, fontWeight: 700, color: '#f0f0f5', marginBottom: 8 }}>
                  {article.title}
                </p>
                {article.excerpt && (
                  <p className="clamp-2" style={{ fontSize: 13, color: '#9898aa', lineHeight: 1.5, marginBottom: 12 }}>
                    {article.excerpt}
                  </p>
                )}
                <p style={{ fontSize: 12, color: '#5a5a6e' }}>
                  By {article.author || 'Erogram'}
                  {article.published_at && (
                    <> · {new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</>
                  )}
                  {article.read_time_min > 0 && <> · {article.read_time_min} min read</>}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Categories section */}
      <div style={{ marginTop: 80, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
          {[
            { icon: '📚', label: 'Guides & Tutorials', desc: 'Learn how to find and join the best NSFW Telegram groups' },
            { icon: '💡', label: 'Insights & Tips', desc: 'Discover community insights and best practices' },
            { icon: '📰', label: 'News & Updates', desc: 'Stay updated with the latest trends and announcements' },
          ].map(item => (
            <div key={item.label} style={{
              background: '#141417', border: '1px solid #2a2a32',
              borderRadius: 12, padding: '24px', maxWidth: 260, textAlign: 'center',
            }}>
              <p style={{ fontSize: 32, marginBottom: 12 }}>{item.icon}</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#f0f0f5', marginBottom: 8 }}>{item.label}</p>
              <p style={{ fontSize: 13, color: '#9898aa' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
