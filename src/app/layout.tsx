import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { NavBar } from '@/components/layout/NavBar'
import { AgeGate } from '@/components/AgeGate'
import { CookieConsent } from '@/components/CookieConsent'
import Image from 'next/image'
import Link from 'next/link'

const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist',
  weight: ['400', '500', '600', '700', '800', '900'],
})

const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL  || 'https://example.com'
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'GroupsPorn'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:  `${SITE_NAME} — #1 NSFW & Porn Telegram Directory`,
    template: `%s | ${SITE_NAME}`,
  },
  description: `Your #1 hub for NSFW Telegram groups & bots, AI companions & tools, and 1.8M+ OnlyFans creators. Explore and save your favorites — all in one place.`,
  openGraph: { siteName: SITE_NAME, type: 'website' },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <body>
        <AgeGate />
        <NavBar />

        <div style={{ minHeight: 'calc(100vh - 56px)' }}>
          {children}
        </div>

        {/* ═══════════════════════════════════════
            FOOTER
        ═══════════════════════════════════════ */}
        <footer style={{
          background: '#0d0d0f',
          borderTop: '1px solid #1f1f27',
          padding: '48px 24px 24px',
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>

            <div className="footer-grid">

              {/* Brand + tagline */}
              <div>
                <div style={{ marginBottom: 8, lineHeight: 0 }}>
                  <Image src="/logo.png" alt={SITE_NAME} width={140} height={32} style={{ objectFit: 'contain' }} />
                </div>
                <p style={{ fontSize: 13, color: '#9898aa', lineHeight: 1.6, maxWidth: 200, marginBottom: 14 }}>
                  The #1 Porn &amp; NSFW Telegram Directory.
                  Connect, explore, and indulge — safely and anonymously.
                </p>
                <a
                  href="https://t.me/erogrampro"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    fontSize: 13, color: '#0ea5e9', textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-2.02 9.532c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.21 14.238l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.606.348z"/>
                  </svg>
                  Telegram
                </a>
              </div>

              {/* Discover */}
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#f0f0f5', marginBottom: 12 }}>Discover</p>
                <FooterLinks links={[
                  ['Telegram Bots',     '/bots'],
                  ['Telegram Groups',   '/groups'],
                  ['OnlyFans Search',   '/onlyfanssearch'],
                  ['AI NSFW Tools',     '/ainsfw'],
                  ['Articles & Guides', '/articles'],
                ]} />
              </div>

              {/* Advertise */}
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#f0f0f5', marginBottom: 12 }}>Advertise</p>
                <FooterLinks links={[
                  ['Get Listed', '/add'],
                  ['Advertise',  '/advertise'],
                ]} />
              </div>

              {/* Contact */}
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#f0f0f5', marginBottom: 12 }}>Contact</p>
                <FooterLinks links={[
                  ['Contact & Support', '/contact'],
                  ['Privacy Policy',    '/privacy'],
                ]} />
              </div>

            </div>

            {/* Bottom bar */}
            <div style={{
              borderTop: '1px solid #1f1f27', paddingTop: 20,
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
            }}>
              <p style={{ fontSize: 12, color: '#5a5a6e', margin: 0 }}>
                © {SITE_NAME} {new Date().getFullYear()} — For adults 18+ only.
              </p>
              <a
                href="https://www.rtalabel.org/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  border: '1px solid #3a3a48', color: '#5a5a6e',
                  fontSize: 10, fontWeight: 700,
                  padding: '2px 6px', borderRadius: 3, letterSpacing: '0.5px',
                  textDecoration: 'none',
                }}
              >
                RTA®
              </a>
            </div>

          </div>
        </footer>

        <CookieConsent />
      </body>
    </html>
  )
}

function FooterLinks({ links }: { links: [string, string][] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {links.map(([label, href]) => (
        <Link key={href} href={href} className="footer-link" style={{
          fontSize: 13, color: '#9898aa',
          textDecoration: 'none', transition: 'color 0.15s',
        }}>
          {label}
        </Link>
      ))}
    </div>
  )
}
