import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Advertise — Reach Thousands of NSFW Users',
  description: 'Advertise your adult brand, Telegram group, or OnlyFans on our platform and reach thousands of daily users.',
}

const PLANS = [
  {
    name: 'Basic Listing',
    price: 'Free',
    period: '',
    features: ['Listed in directory', 'Category page placement', 'Standard card display', 'Community review'],
    cta: 'Get Listed',
    href: '/add',
    accent: false,
  },
  {
    name: 'Featured',
    price: '$49',
    period: '/ month',
    features: ['Priority placement', 'Featured badge', 'Top of category page', 'Analytics dashboard', 'Email support'],
    cta: 'Contact Us',
    href: '/contact',
    accent: true,
  },
  {
    name: 'Premium Banner',
    price: '$199',
    period: '/ month',
    features: ['Homepage banner', 'Category page banners', 'Dedicated landing page', 'Monthly report', 'Priority support'],
    cta: 'Contact Us',
    href: '/contact',
    accent: false,
  },
]

export default function AdvertisePage() {
  return (
    <main style={{ padding: '60px 24px', maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ fontSize: 40, fontWeight: 900, color: '#f0f0f5', marginBottom: 12 }}>
        Advertise on{' '}
        <span style={{ color: '#e8356d' }}>{process.env.NEXT_PUBLIC_SITE_NAME || 'GroupsPorn'}</span>
      </h1>
      <p style={{ color: '#9898aa', fontSize: 15, maxWidth: 520, margin: '0 auto 60px' }}>
        Reach thousands of engaged adults daily. List your Telegram group, bot, or run targeted banner campaigns.
      </p>

      {/* Stats */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap', marginBottom: 60 }}>
        {[
          { value: '+5K', label: 'Listed Groups' },
          { value: '1.8M+', label: 'OF Creators' },
          { value: '4.9M+', label: 'Total Views' },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 32, fontWeight: 800, color: '#e8356d', marginBottom: 4 }}>{s.value}</p>
            <p style={{ fontSize: 13, color: '#9898aa', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Plans */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 60 }}>
        {PLANS.map(plan => (
          <div key={plan.name} style={{
            background: plan.accent ? 'rgba(232,53,109,0.07)' : '#141417',
            border: `1px solid ${plan.accent ? '#e8356d' : '#2a2a32'}`,
            borderRadius: 14, padding: '32px 24px',
            position: 'relative',
          }}>
            {plan.accent && (
              <span style={{
                position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                background: '#e8356d', color: '#fff', fontSize: 11, fontWeight: 700,
                padding: '3px 14px', borderRadius: 999, letterSpacing: 1,
              }}>
                POPULAR
              </span>
            )}
            <p style={{ fontSize: 16, fontWeight: 700, color: '#f0f0f5', marginBottom: 8 }}>{plan.name}</p>
            <p style={{ marginBottom: 24 }}>
              <span style={{ fontSize: 32, fontWeight: 900, color: '#f0f0f5' }}>{plan.price}</span>
              <span style={{ fontSize: 14, color: '#9898aa' }}>{plan.period}</span>
            </p>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: 28, textAlign: 'left' }}>
              {plan.features.map(f => (
                <li key={f} style={{ fontSize: 14, color: '#9898aa', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#22c55e', fontSize: 16 }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href={plan.href} style={{
              display: 'block', background: plan.accent ? '#e8356d' : '#1a1a1f',
              border: `1px solid ${plan.accent ? '#e8356d' : '#2a2a32'}`,
              color: '#fff', padding: '12px', borderRadius: 8,
              fontWeight: 700, fontSize: 14, textDecoration: 'none',
              transition: 'opacity 0.15s',
            }}>
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      <p style={{ color: '#9898aa', fontSize: 13 }}>
        For custom campaigns or partnerships,{' '}
        <Link href="/contact" style={{ color: '#e8356d', textDecoration: 'none' }}>contact us</Link>.
      </p>
    </main>
  )
}
