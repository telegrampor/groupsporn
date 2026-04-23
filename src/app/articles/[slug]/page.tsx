import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getArticleBySlug, getArticles } from '@/lib/supabase/queries/articles'
import { ChevronRight } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) return { title: 'Article Not Found' }
  return {
    title: article.seo_title || article.title,
    description: article.seo_description || article.excerpt,
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [article, related] = await Promise.all([
    getArticleBySlug(slug),
    getArticles(4),
  ])

  if (!article) notFound()

  const relatedArticles = related.filter(a => a.slug !== slug).slice(0, 3)

  return (
    <main style={{ padding: '32px 24px', maxWidth: 800, margin: '0 auto' }}>
      {/* Breadcrumb */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#5a5a6e', marginBottom: 32 }}>
        <Link href="/" style={{ color: '#9898aa', textDecoration: 'none' }}>Home</Link>
        <ChevronRight size={12} />
        <Link href="/articles" style={{ color: '#9898aa', textDecoration: 'none' }}>Articles</Link>
        <ChevronRight size={12} />
        <span style={{ color: '#f0f0f5' }}>{article.title}</span>
      </nav>

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {article.tags.map(tag => (
            <span key={tag} style={{
              fontSize: 11, fontWeight: 700, color: '#0ea5e9',
              background: 'rgba(14,165,233,0.1)', padding: '3px 10px', borderRadius: 999,
              textTransform: 'uppercase', letterSpacing: 0.5,
            }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      <h1 style={{ fontSize: 32, fontWeight: 900, color: '#f0f0f5', lineHeight: 1.2, marginBottom: 16 }}>
        {article.title}
      </h1>

      <p style={{ fontSize: 13, color: '#5a5a6e', marginBottom: 32 }}>
        By {article.author || 'Erogram'}
        {article.published_at && (
          <> · {new Date(article.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</>
        )}
        {article.read_time_min > 0 && <> · {article.read_time_min} min read</>}
      </p>

      {/* Cover image */}
      {article.cover_image_url && (
        <div style={{ position: 'relative', height: 380, borderRadius: 12, overflow: 'hidden', marginBottom: 40, background: '#1a1a1f' }}>
          <Image src={article.cover_image_url} alt={article.title} fill sizes="800px" style={{ objectFit: 'cover' }} />
        </div>
      )}

      {/* Content */}
      <div style={{ fontSize: 16, lineHeight: 1.8, color: '#c8c8d8' }}>
        {article.content ? (
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        ) : article.excerpt ? (
          <p>{article.excerpt}</p>
        ) : (
          <p style={{ color: '#9898aa' }}>Content coming soon.</p>
        )}
      </div>

      {/* Related */}
      {relatedArticles.length > 0 && (
        <div style={{ marginTop: 64 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f0f0f5', marginBottom: 20 }}>
            Related <span style={{ color: '#e8356d' }}>Articles</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {relatedArticles.map(a => (
              <Link key={a.id} href={`/articles/${a.slug}`} style={{
                display: 'flex', gap: 16, padding: 16,
                background: '#141417', border: '1px solid #2a2a32',
                borderRadius: 10, textDecoration: 'none',
              }} className="card-hover">
                {a.cover_image_url && (
                  <div style={{ position: 'relative', width: 80, height: 60, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#1a1a1f' }}>
                    <Image src={a.cover_image_url} alt={a.title} fill sizes="80px" style={{ objectFit: 'cover' }} />
                  </div>
                )}
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#f0f0f5', marginBottom: 4 }} className="clamp-2">{a.title}</p>
                  <p style={{ fontSize: 12, color: '#5a5a6e' }}>
                    {a.published_at && new Date(a.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #2a2a32' }}>
        <Link href="/articles" style={{ color: '#e8356d', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
          ← Back to Articles
        </Link>
      </div>
    </main>
  )
}
