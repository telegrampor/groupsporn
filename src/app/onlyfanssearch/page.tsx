import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'OnlyFans Search — Find 1.8M+ Creators',
  description: 'Search over 1.8 million OnlyFans creator profiles by name, username, or category.',
}

export default function OnlyFansSearchPage() {
  return (
    <main style={{
      minHeight: 'calc(100vh - 56px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '60px 24px', textAlign: 'center',
    }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.3)',
        borderRadius: 999, padding: '5px 14px',
        fontSize: 12, color: '#0ea5e9', fontWeight: 600, marginBottom: 20,
      }}>
        +1.8M OnlyFans Creators
      </div>

      <h1 style={{ fontSize: 40, fontWeight: 900, color: '#f0f0f5', marginBottom: 12, maxWidth: 600 }}>
        Search <span style={{ color: '#0ea5e9' }}>OnlyFans</span> Creators
      </h1>
      <p style={{ color: '#9898aa', fontSize: 15, marginBottom: 40, maxWidth: 440 }}>
        Find creators by name, username, or browse by category. Access profiles, stats, and links instantly.
      </p>

      <OFSearchForm />

      <div style={{
        display: 'flex', gap: 24, marginTop: 56, flexWrap: 'wrap', justifyContent: 'center',
      }}>
        {[
          { value: '1.8M+', label: 'Creator profiles' },
          { value: 'Free', label: 'No account needed' },
          { value: 'Daily', label: 'Updated profiles' },
        ].map(stat => (
          <div key={stat.label} style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 28, fontWeight: 800, color: '#f0f0f5', marginBottom: 4 }}>{stat.value}</p>
            <p style={{ fontSize: 12, color: '#9898aa', textTransform: 'uppercase', letterSpacing: 1 }}>{stat.label}</p>
          </div>
        ))}
      </div>
    </main>
  )
}

function OFSearchForm() {
  return (
    <form
      action="/onlyfanssearch"
      method="get"
      style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 520 }}
    >
      <input
        name="q"
        type="search"
        placeholder="Search by name or @username…"
        style={{
          flex: 1, background: '#141417', border: '1px solid #2a2a32',
          color: '#f0f0f5', padding: '13px 18px', borderRadius: 8,
          fontSize: 15, outline: 'none',
        }}
        autoComplete="off"
      />
      <button
        type="submit"
        style={{
          background: '#0ea5e9', color: '#fff', border: 'none',
          padding: '13px 22px', borderRadius: 8,
          fontWeight: 700, fontSize: 15, cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        Search
      </button>
    </form>
  )
}
