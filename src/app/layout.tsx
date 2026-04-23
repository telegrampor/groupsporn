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
            FOOTER — fidelity to erogram.pro DOM
        ═══════════════════════════════════════ */}
        <footer className="bg-[#0a0a0a] border-t border-white/5 pt-16 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">

              {/* Brand */}
              <div className="col-span-2 md:col-span-1">
                <div style={{ marginBottom: 12, lineHeight: 0 }}>
                  <Image src="/logo.png" alt={SITE_NAME} width={140} height={32} style={{ objectFit: 'contain' }} />
                </div>
                <p className="text-[#666] text-sm leading-relaxed mb-4">
                  The #1 NSFW &amp; Porn Telegram and AI Directory.
                  Discover the best communities and bots.
                </p>
                <a
                  href="https://t.me/erogrampro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#0ea5e9] text-sm font-medium hover:opacity-80 transition-opacity"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-2.02 9.532c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.21 14.238l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.606.348z" />
                  </svg>
                  Telegram
                </a>
              </div>

              {/* Directory */}
              <div>
                <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Directory</h4>
                <ul className="space-y-2 text-[#999] text-sm">
                  {([
                    ['Telegram Groups',   '/groups'],
                    ['Telegram Bots',     '/bots'],
                    ['AI NSFW Tools',     '/ainsfw'],
                    ['OnlyFans Search',   '/onlyfanssearch'],
                    ['Articles & Guides', '/articles'],
                  ] as const).map(([label, href]) => (
                    <li key={href}>
                      <Link href={href} className="hover:text-white transition-colors">{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Advertise */}
              <div>
                <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Advertise</h4>
                <ul className="space-y-2 text-[#999] text-sm">
                  {([
                    ['Get Listed', '/add'],
                    ['Advertise',  '/advertise'],
                  ] as const).map(([label, href]) => (
                    <li key={href}>
                      <Link href={href} className="hover:text-white transition-colors">{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Support */}
              <div>
                <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Support</h4>
                <ul className="space-y-2 text-[#999] text-sm">
                  {([
                    ['Contact Us',     '/contact'],
                    ['Privacy Policy', '/privacy'],
                  ] as const).map(([label, href]) => (
                    <li key={href}>
                      <Link href={href} className="hover:text-white transition-colors">{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Bottom bar */}
            <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-[#444] text-xs">
                © {SITE_NAME} {new Date().getFullYear()}. All rights reserved. For adults 18+ only.
              </p>
              <div className="flex items-center gap-4">
                <a
                  href="https://www.rtalabel.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 border border-[#444] text-[#444] text-[10px] font-bold rounded hover:border-[#666] hover:text-[#666] transition-colors"
                >
                  RTA ®
                </a>
              </div>
            </div>

          </div>
        </footer>

        <CookieConsent />
      </body>
    </html>
  )
}
