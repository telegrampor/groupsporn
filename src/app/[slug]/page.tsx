import { notFound }     from 'next/navigation'
import { Metadata }     from 'next'
import Image            from 'next/image'
import Link             from 'next/link'
import { getGroupBySlug, getSimilarGroups, getAllPublishedSlugs } from '@/lib/supabase/queries/groups'
import { buildGroupMeta, webPageSchema, faqSchema, fmt, cap } from '@/lib/utils/seo'

export async function generateStaticParams() {
  const slugs = await getAllPublishedSlugs()
  return slugs.map(g => ({ slug: g.slug }))
}

export const revalidate = 86400  // ISR: revalida a cada 24h

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const group = await getGroupBySlug(slug)
  if (!group) return { title: 'Not Found', robots: { index: false } }
  return buildGroupMeta(group)
}

export default async function GroupDetailPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const group = await getGroupBySlug(slug)
  if (!group) notFound()

  const similar = await getSimilarGroups(group.category_slug, slug)
  const type    = group.entity_type === 'channel' ? 'Channel' : 'Group'
  const members = group.member_count > 0 ? fmt(group.member_count) : null

  return (
    <>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema(group)) }} />
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(group.name)) }} />

      <main style={{ minHeight: '100vh' }}>

        {/* Banner blur */}
        <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
          {group.thumbnail_url && (
            <Image src={group.thumbnail_url} alt="" fill priority
              sizes="100vw"
              style={{ objectFit: 'cover', filter: 'blur(20px)',
                opacity: 0.2, transform: 'scale(1.1)' }} />
          )}
          <div style={{ position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, transparent, var(--bg-primary))' }} />
        </div>

        <div style={{ maxWidth: 800, margin: '-48px auto 0', padding: '0 16px 64px' }}>

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" style={{
            display: 'flex', flexWrap: 'wrap', gap: 6,
            fontSize: 12, color: 'var(--text-muted)', marginBottom: 20,
          }}>
            {[
              ['Home', '/'],
              ['Groups', '/groups'],
              [cap(group.category_slug), `/best-telegram-groups/${group.category_slug}`],
            ].map(([label, href]) => (
              <>
                <Link key={href} href={href}
                  style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                  {label}
                </Link>
                <span>/</span>
              </>
            ))}
            <span style={{ color: 'var(--text-secondary)' }}>{group.name}</span>
          </nav>

          {/* Card principal */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{
              position: 'relative', width: 88, height: 88, flexShrink: 0,
              borderRadius: 16, overflow: 'hidden',
              border: '1px solid var(--border)', background: 'var(--bg-card)',
            }}>
              {group.thumbnail_url ? (
                <Image src={group.thumbnail_url} alt={group.name}
                  fill sizes="88px" style={{ objectFit: 'cover' }} priority />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center',
                  justifyContent: 'center', height: '100%', fontSize: 32 }}>📢</div>
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                {group.is_verified && (
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#22c55e' }}>
                    ✓ Verified
                  </span>
                )}
                {group.is_new && (
                  <span style={{
                    background: 'var(--badge-new)', color: '#fff',
                    fontSize: 10, fontWeight: 700, padding: '2px 8px',
                    borderRadius: 999,
                  }}>NEW</span>
                )}
                {group.is_featured && (
                  <span style={{
                    background: 'var(--badge-featured)', color: '#fff',
                    fontSize: 10, fontWeight: 700, padding: '2px 8px',
                    borderRadius: 999,
                  }}>⭐ FEATURED</span>
                )}
              </div>

              {/* H1 — keyword principal */}
              <h1 style={{
                fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 800,
                color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: 10,
              }}>
                {group.name}
              </h1>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16,
                fontSize: 13, color: 'var(--text-secondary)' }}>
                <Link href={`/best-telegram-groups/${group.category_slug}`}
                  style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
                  #{cap(group.category_slug)}
                </Link>
                {group.country && group.country !== 'All' && (
                  <span>🌍 {group.country}</span>
                )}
                {members && <span>👥 {members} members</span>}
              </div>
            </div>
          </div>

          {/* Descrição expandida */}
          {(group.seo_description || group.description) && (
            <div style={{
              marginTop: 20, padding: 16, borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7,
            }}>
              <p>{group.seo_description || group.description}</p>
            </div>
          )}

          {/* CTA Join */}
          <div style={{
            marginTop: 24, padding: '24px 20px', borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            textAlign: 'center',
          }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>
              Click below to access this {type.toLowerCase()} on Telegram.
            </p>
            <a href={`/api/join/${group.slug}`}
              rel="nofollow noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'var(--accent)', color: '#fff',
                padding: '14px 36px', borderRadius: 'var(--radius-md)',
                fontWeight: 700, fontSize: 16, textDecoration: 'none',
                boxShadow: '0 0 30px rgba(232,53,109,0.3)',
              }}>
              🚀 Join {type} Now
            </a>
          </div>

          {/* Similar groups */}
          {similar.length > 0 && (
            <section style={{ marginTop: 40 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700,
                marginBottom: 14, color: 'var(--text-primary)' }}>
                Similar Communities
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: 10,
              }}>
                {similar.map(s => (
                  <Link key={s.id} href={`/${s.slug}`} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: 12, borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    textDecoration: 'none',
                  }}>
                    <div style={{
                      position: 'relative', width: 36, height: 36,
                      borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                      background: 'var(--bg-secondary)',
                    }}>
                      {s.thumbnail_url && (
                        <Image src={s.thumbnail_url} alt={s.name}
                          fill sizes="36px" style={{ objectFit: 'cover' }}
                          loading="lazy" />
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{
                        fontSize: 12, fontWeight: 600, color: 'var(--text-primary)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{s.name}</p>
                      {s.member_count > 0 && (
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {fmt(s.member_count)}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* FAQ */}
          <section style={{ marginTop: 40 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700,
              marginBottom: 14, color: 'var(--text-primary)' }}>
              Frequently Asked Questions
            </h2>
            {[
              [`Is ${group.name} verified?`,
               `Yes. ${group.name} is manually verified to be active and match its description.`],
              [`How do I join ${group.name}?`,
               'Click "Join Channel Now" above. You will be redirected to Telegram instantly.'],
              ['Is it free?',
               'Most groups are free. Some communities may require a Telegram subscription.'],
              [`What category is ${group.name}?`,
               `${group.name} is listed under ${cap(group.category_slug)}.${group.country && group.country !== 'All' ? ` Origin: ${group.country}.` : ''}`],
            ].map(([q, a]) => (
              <details key={q} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', marginBottom: 6,
              }}>
                <summary style={{
                  padding: '13px 16px', cursor: 'pointer',
                  fontWeight: 500, fontSize: 14, color: 'var(--text-primary)',
                  listStyle: 'none',
                }}>{q}</summary>
                <p style={{ padding: '0 16px 13px',
                  color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>
                  {a}
                </p>
              </details>
            ))}
          </section>

        </div>
      </main>
    </>
  )
}
