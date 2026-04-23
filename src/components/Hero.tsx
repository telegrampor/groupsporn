import Link from 'next/link'
import { Send, Lock, Sparkles, Search } from 'lucide-react'

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
        <Link href="/#groups" className="cta-btn cta-blue">
          <Send size={15} /> Explore Groups
        </Link>
        <Link href="/bots" className="cta-btn cta-blue">
          <Lock size={15} /> Explore Bots
        </Link>
        <Link href="/ainsfw" className="cta-btn cta-red">
          <Sparkles size={15} /> Explore AI NSFW
        </Link>
        <Link href="/onlyfanssearch" className="cta-btn cta-blue">
          <Search size={15} />
          ONLYFANS SEARCH{' '}
          <span style={{ fontSize: 11, opacity: 0.8, fontWeight: 500 }}>+1.8M creators</span>
        </Link>
      </div>

      <div className="stats-grid" style={{ maxWidth: 860, margin: '0 auto' }}>
        <StatCard value="+5K"       label="Groups" />
        <StatCard value="0"         label="Visiting Now"      pulse />
        <StatCard value="4,981,220" label="Views"             pulse />
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
      borderRadius: 12, padding: '20px 16px', textAlign: 'center',
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
