import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for our NSFW directory service.',
}

const SITE = process.env.NEXT_PUBLIC_SITE_NAME || 'GroupsPorn'

export default function PrivacyPage() {
  return (
    <main style={{ padding: '48px 24px', maxWidth: 760, margin: '0 auto' }}>
      <h1 style={{ fontSize: 32, fontWeight: 900, color: '#f0f0f5', marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ color: '#5a5a6e', fontSize: 13, marginBottom: 40 }}>Last updated: April 2026</p>

      {SECTIONS.map(s => (
        <div key={s.title} style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f0f0f5', marginBottom: 10 }}>{s.title}</h2>
          <p style={{ color: '#9898aa', fontSize: 14, lineHeight: 1.8 }}>{s.body}</p>
        </div>
      ))}
    </main>
  )
}

const SECTIONS = [
  {
    title: '1. Information We Collect',
    body: `We collect minimal data to operate our service. This includes: pages visited, time spent on site, browser type, and approximate location (country level only). We do not collect your name, email, or any personal information unless you voluntarily register for an account.`,
  },
  {
    title: '2. Cookies',
    body: `We use cookies to remember your preferences (age verification, language) and to analyze traffic via anonymous analytics. We do not use cookies for advertising targeting. You may decline cookies through our cookie consent banner.`,
  },
  {
    title: '3. How We Use Your Data',
    body: `Anonymous usage data is used solely to improve site performance and content. We do not sell, share, or rent any data to third parties. Authentication data (if you sign in) is stored securely via Supabase with industry-standard encryption.`,
  },
  {
    title: '4. Third-Party Services',
    body: `Our site uses Supabase (authentication and database), Cloudflare (CDN and security), and optional analytics tools. All third-party services have their own privacy policies. We link only to external platforms (Telegram) that are publicly available.`,
  },
  {
    title: '5. Adult Content Disclaimer',
    body: `This site contains adult-oriented material for users 18 years and older. We are fully compliant with RTA labeling standards. We do not host, upload, or create adult content — we link to publicly available Telegram groups and channels.`,
  },
  {
    title: '6. DMCA & Content Removal',
    body: `If you believe content linked from our platform violates your copyright, contact us at the address below. We will respond to valid DMCA takedown requests within 48 hours and remove the listing if appropriate.`,
  },
  {
    title: '7. Contact',
    body: `For privacy-related inquiries, please use our contact form or reach us on Telegram at @erogrampro.`,
  },
]
