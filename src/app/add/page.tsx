import type { Metadata } from 'next'
import Link from 'next/link'
import { Send, Bot, Sparkles, User } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Get Listed — Add Your Group, Bot or Tool',
  description: 'Submit your Telegram group, bot, AI NSFW tool or OnlyFans profile to our directory.',
}

const OPTIONS = [
  {
    href: '/add/group',
    icon: <Send size={28} color="#0ea5e9" />,
    title: 'Submit your Telegram Group',
    description: 'Add your Telegram group or channel to our directory.',
    bg: 'rgba(14,165,233,0.08)',
    border: 'rgba(14,165,233,0.25)',
  },
  {
    href: '/add/bot',
    icon: <Bot size={28} color="#a855f7" />,
    title: 'Submit your Telegram Bot',
    description: 'List your AI or NSFW bot for thousands of users to discover.',
    bg: 'rgba(168,85,247,0.08)',
    border: 'rgba(168,85,247,0.25)',
  },
  {
    href: '/add/ainsfw',
    icon: <Sparkles size={28} color="#e8356d" />,
    title: '18+ Submit your AI NSFW Tool',
    description: 'Add your adult AI tool, companion, or image generator.',
    bg: 'rgba(232,53,109,0.08)',
    border: 'rgba(232,53,109,0.25)',
  },
  {
    href: '/add/creator',
    icon: <User size={28} color="#f59e0b" />,
    title: 'Submit OnlyFans Creator',
    description: 'Get your OnlyFans profile listed in our 1.8M+ creator index.',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.25)',
  },
]

export default function AddPage() {
  return (
    <main style={{ minHeight: 'calc(100vh - 56px)', padding: '60px 24px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: 36, fontWeight: 900, color: '#f0f0f5', marginBottom: 8 }}>
          Get Listed on{' '}
          <span style={{ color: '#e8356d' }}>
            {process.env.NEXT_PUBLIC_SITE_NAME || 'GroupsPorn'}
          </span>
        </h1>
        <p style={{ fontSize: 15, color: '#9898aa', marginBottom: 48 }}>
          Get listed on the largest NSFW hub and reach thousands of new users.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {OPTIONS.map(opt => (
            <Link
              key={opt.href}
              href={opt.href}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                background: opt.bg, border: `1px solid ${opt.border}`,
                borderRadius: 12, padding: '20px 24px',
                textDecoration: 'none', textAlign: 'left',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              className="card-hover"
            >
              <div style={{
                width: 52, height: 52, borderRadius: 12,
                background: 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {opt.icon}
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#f0f0f5', marginBottom: 4 }}>
                  {opt.title}
                </p>
                <p style={{ fontSize: 13, color: '#9898aa' }}>
                  {opt.description}
                </p>
              </div>
              <span style={{ marginLeft: 'auto', fontSize: 18, color: '#5a5a6e' }}>→</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
