import Link from 'next/link'

export function Hero() {
  return (
    <section
      id="hero"
      className="hero-section"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(232,53,109,0.15) 0%, transparent 60%)',
        textAlign: 'center',
      }}
    >
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 9,
        border: '1px solid #2a2a32', borderRadius: 999,
        padding: '6px 14px', fontSize: 13, color: '#9898aa',
        marginBottom: 24, background: 'rgba(20,20,23,0.7)',
      }}>
        <span className="pulse-dot-red" />
        The #1 NSFW &amp; Porn Telegram and AI Directory
      </div>

      <h1 className="hero-h1" style={{
        fontWeight: 900, letterSpacing: '-1px',
        margin: '0 auto 16px', maxWidth: '100%',
      }}>
        Discover NSFW &amp; Porn{' '}
        Telegram groups,{' '}
        <span style={{ color: '#e8356d' }}>bots &amp; AI</span>
      </h1>

      <p className="hero-subtitle">
        Your #1 hub for NSFW Telegram groups &amp; bots, AI companions &amp; tools,
        and 1.8M+ OnlyFans creators. Explore and save your favorites all in one place.
      </p>

      <div className="hero-ctas" style={{ marginBottom: 40 }}>
        {/* Explore Groups — azul Telegram */}
        <Link href="/#groups" style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          gap: 6, padding: '10px 20px', borderRadius: 8,
          background: '#0088cc', border: '1px solid #0088cc',
          color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z" />
          </svg>
          Explore Groups
        </Link>

        {/* Explore Bots — azul Telegram */}
        <Link href="/bots" style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          gap: 6, padding: '10px 20px', borderRadius: 8,
          background: '#0088cc', border: '1px solid #0088cc',
          color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <circle cx="9" cy="16" r="1" />
            <circle cx="15" cy="16" r="1" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          Explore Bots
        </Link>

        {/* Explore AI NSFW — azul Telegram */}
        <Link href="/ainsfw" style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          gap: 6, padding: '10px 20px', borderRadius: 8,
          background: '#0088cc', border: '1px solid #0088cc',
          color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}>
          <span style={{ fontSize: 14, lineHeight: 1 }}>🔞</span>
          Explore AI NSFW
        </Link>

        {/* OnlyFans Search — azul claro */}
        <Link href="/ofsearch" style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          gap: 6, padding: '10px 20px', borderRadius: 8,
          background: '#00AFF0', border: '1px solid #00AFF0',
          color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}>
          ONLYFANS SEARCH{' '}
          <span style={{ fontSize: 11, fontWeight: 400, opacity: 0.85 }}>+1.8M creators</span>
        </Link>
      </div>

      <div className="stats-grid" style={{ maxWidth: 860, margin: '0 auto' }}>
        <StatCard value="+5K"       label="Groups" />
        <StatCard value="0"         label="Visiting Now" pulse />
        <StatCard value="4,981,220" label="Views"        pulse />
        <StatCard value="+1.8M"     label="OnlyFans Creators" />
      </div>
    </section>
  )
}

function StatCard({ value, label, pulse = false }: {
  value: string
  label: string
  pulse?: boolean
}) {
  return (
    <div style={{
      background: '#141417', border: '1px solid #2a2a32',
      borderRadius: 12, padding: '24px 16px', textAlign: 'center',
    }}>
      <p style={{ fontSize: 28, fontWeight: 800, color: '#f0f0f5', marginBottom: 4 }}>{value}</p>
      <p style={{
        fontSize: 11, color: '#9898aa', textTransform: 'uppercase',
        letterSpacing: '1px', display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: 5, margin: 0,
      }}>
        {pulse && <span className="pulse-dot" />}
        {label}
      </p>
    </div>
  )
}
