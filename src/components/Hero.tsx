import Link from 'next/link'

export function Hero() {
  return (
    <section
      id="hero"
      className="hero-section"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(179,27,27,0.12) 0%, transparent 60%)',
        textAlign: 'center',
      }}
    >
      {/* Badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 999,
        padding: '5px 14px', fontSize: 13, color: '#999',
        marginBottom: 16, background: 'rgba(20,20,20,0.6)',
      }}>
        <span className="pulse-dot-red" />
        The #1 NSFW &amp; Porn Telegram and AI Directory
      </div>

      {/* H1 */}
      <h1 className="hero-h1" style={{ fontWeight: 900, letterSpacing: '-0.5px', margin: '0 auto 14px' }}>
        <span style={{ color: '#f5f5f5' }}>Discover NSFW &amp; Porn Telegram groups, </span>
        <span style={{ color: '#ff3366' }}>bots &amp; AI</span>
      </h1>

      {/* Subtitle */}
      <p className="hero-subtitle">
        Your #1 hub for NSFW Telegram groups &amp; bots, AI companions &amp; tools,
        and 1.8M+ OnlyFans creators. Explore and save your favorites all in one place.
      </p>

      {/* CTAs */}
      <div className="hero-ctas" style={{ marginBottom: 32 }}>
        <Link href="/#groups" style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          gap: 6, padding: '10px 18px', borderRadius: 10,
          background: '#0088cc', color: '#fff', fontWeight: 600, fontSize: 14,
          textDecoration: 'none', whiteSpace: 'nowrap',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z" />
          </svg>
          Explore Groups
        </Link>
        <Link href="/bots" style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          gap: 6, padding: '10px 18px', borderRadius: 10,
          background: '#0088cc', color: '#fff', fontWeight: 600, fontSize: 14,
          textDecoration: 'none', whiteSpace: 'nowrap',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <circle cx="9" cy="16" r="1" />
            <circle cx="15" cy="16" r="1" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          Explore Bots
        </Link>
        <Link href="/ainsfw" style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          gap: 6, padding: '10px 18px', borderRadius: 10,
          background: '#0088cc', color: '#fff', fontWeight: 600, fontSize: 14,
          textDecoration: 'none', whiteSpace: 'nowrap',
        }}>
          <span style={{ fontSize: 14, lineHeight: 1 }}>🔞</span>
          Explore AI NSFW
        </Link>
        <Link href="/ofsearch" style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          gap: 6, padding: '10px 18px', borderRadius: 10,
          background: '#00AFF0', color: '#fff', fontWeight: 700, fontSize: 14,
          textDecoration: 'none', whiteSpace: 'nowrap',
        }}>
          ONLYFANS SEARCH{' '}
          <span style={{ fontSize: 11, fontWeight: 400, opacity: 0.85 }}>+1.8M creators</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ maxWidth: 800, margin: '0 auto' }}>
        <StatCard value="+5K"       label="Groups" />
        <StatCard value="0"         label="Visiting Now" pulse />
        <StatCard value="4,981,220" label="Views"        pulse />
        <StatCard value="+1.8M"     label="OnlyFans Creators" />
      </div>
    </section>
  )
}

function StatCard({ value, label, pulse = false }: {
  value: string; label: string; pulse?: boolean
}) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 12, padding: '16px 12px', textAlign: 'center',
    }}>
      <p style={{ fontSize: 22, fontWeight: 800, color: '#f5f5f5', marginBottom: 4, lineHeight: 1 }}>{value}</p>
      <p style={{
        fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
        letterSpacing: '1px', display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: 4, margin: 0, fontWeight: 600,
      }}>
        {pulse && (
          <span style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8 }}>
            <span style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: '#22c55e', opacity: 0.75,
              animation: 'pulse-green 2s ease-in-out infinite',
            }} />
            <span style={{
              position: 'relative', display: 'inline-flex', borderRadius: '50%',
              width: 8, height: 8, background: '#22c55e',
            }} />
          </span>
        )}
        {label}
      </p>
    </div>
  )
}
