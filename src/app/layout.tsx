import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { NavBar } from '@/components/layout/NavBar'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL  || 'https://example.com'
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'EROgram'

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
    <html lang="en" className={inter.className}>
      <body>
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
                <div style={{
                  fontWeight: 800, fontSize: 18,
                  letterSpacing: '-0.5px', marginBottom: 8,
                }}>
                  <span style={{ color: '#e8356d' }}>ERO</span>
                  <span style={{ color: '#f0f0f5' }}>gram</span>
                </div>
                <p style={{
                  fontSize: 13, color: '#9898aa',
                  lineHeight: 1.6, maxWidth: 200,
                }}>
                  The #1 Porn &amp; NSFW Telegram Directory.
                  Connect, explore, and indulge — safely and anonymously.
                </p>
              </div>

              {/* Discover */}
              <div>
                <p style={{
                  fontSize: 13, fontWeight: 700,
                  color: '#f0f0f5', marginBottom: 12,
                }}>Discover</p>
                <FooterLinks links={[
                  ['Telegram Bots',     '/bots'],
                  ['Telegram Groups',   '/groups'],
                  ['OnlyFans Search',   '/ofsearch'],
                  ['AI NSFW Tools',     '/ainsfw'],
                  ['Articles & Guides', '/articles'],
                ]} />
              </div>

              {/* Advertise */}
              <div>
                <p style={{
                  fontSize: 13, fontWeight: 700,
                  color: '#f0f0f5', marginBottom: 12,
                }}>Advertise</p>
                <FooterLinks links={[
                  ['Get Listed', '/add'],
                  ['Advertise',  '/advertise'],
                ]} />
              </div>

              {/* Contact */}
              <div>
                <p style={{
                  fontSize: 13, fontWeight: 700,
                  color: '#f0f0f5', marginBottom: 12,
                }}>Contact</p>
                <FooterLinks links={[
                  ['Contact Us', '/contact'],
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
              <span style={{
                border: '1px solid #3a3a48', color: '#5a5a6e',
                fontSize: 10, fontWeight: 700,
                padding: '2px 6px', borderRadius: 3, letterSpacing: '0.5px',
              }}>
                RTA®
              </span>
            </div>

          </div>
        </footer>
      </body>
    </html>
  )
}

function FooterLinks({ links }: { links: [string, string][] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {links.map(([label, href]) => (
        <a key={href} href={href} className="footer-link" style={{
          fontSize: 13, color: '#9898aa',
          textDecoration: 'none', transition: 'color 0.15s',
        }}>
          {label}
        </a>
      ))}
    </div>
  )
}
