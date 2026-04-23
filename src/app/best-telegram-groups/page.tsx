import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Best NSFW Telegram Groups — Curated Top Lists',
  description: 'Browse our curated lists of the best porn and NSFW Telegram groups by category.',
}

const CATEGORIES = [
  { slug: 'ai-nsfw',      label: 'Best AI NSFW Groups',       count: 'Top 10 AI NSFW communities' },
  { slug: 'adult',        label: 'Best Adult Groups',          count: 'Top 10 Adult communities' },
  { slug: 'amateur',      label: 'Best Amateur Groups',        count: 'Top 10 Amateur communities' },
  { slug: 'anal',         label: 'Best Anal Groups',           count: 'Top 10 Anal communities' },
  { slug: 'asian',        label: 'Best Asian Groups',          count: 'Top 10 Asian communities' },
  { slug: 'bdsm',         label: 'Best BDSM Groups',           count: 'Top 10 BDSM communities' },
  { slug: 'big-ass',      label: 'Best Big Ass Groups',        count: 'Top 10 Big Ass communities' },
  { slug: 'big-tits',     label: 'Best Big Tits Groups',       count: 'Top 10 Big Tits communities' },
  { slug: 'blonde',       label: 'Best Blonde Groups',         count: 'Top 10 Blonde communities' },
  { slug: 'blowjob',      label: 'Best Blowjob Groups',        count: 'Top 10 Blowjob communities' },
  { slug: 'brazil',       label: 'Best Brazil Groups',         count: 'Top 10 Brazil communities' },
  { slug: 'china',        label: 'Best China Groups',          count: 'Top 10 China communities' },
  { slug: 'colombia',     label: 'Best Colombia Groups',       count: 'Top 10 Colombia communities' },
  { slug: 'cosplay',      label: 'Best Cosplay Groups',        count: 'Top 10 Cosplay communities' },
  { slug: 'creampie',     label: 'Best Creampie Groups',       count: 'Top 10 Creampie communities' },
  { slug: 'cuckold',      label: 'Best Cuckold Groups',        count: 'Top 10 Cuckold communities' },
  { slug: 'ebony',        label: 'Best Ebony Groups',          count: 'Top 10 Ebony communities' },
  { slug: 'fantasy',      label: 'Best Fantasy Groups',        count: 'Top 10 Fantasy communities' },
  { slug: 'feet',         label: 'Best Feet Groups',           count: 'Top 10 Feet communities' },
  { slug: 'fetish',       label: 'Best Fetish Groups',         count: 'Top 10 Fetish communities' },
  { slug: 'france',       label: 'Best France Groups',         count: 'Top 10 France communities' },
  { slug: 'free-use',     label: 'Best Free-use Groups',       count: 'Top 10 Free-use communities' },
  { slug: 'japan',        label: 'Best Japan Groups',          count: 'Top 10 Japan communities' },
  { slug: 'latina',       label: 'Best Latina Groups',         count: 'Top 10 Latina communities' },
  { slug: 'lesbian',      label: 'Best Lesbian Groups',        count: 'Top 10 Lesbian communities' },
  { slug: 'milf',         label: 'Best MILF Groups',           count: 'Top 10 MILF communities' },
  { slug: 'masturbation', label: 'Best Masturbation Groups',   count: 'Top 10 Masturbation communities' },
  { slug: 'nsfw-telegram',label: 'Best NSFW-Telegram Groups',  count: 'Top 10 NSFW-Telegram communities' },
  { slug: 'onlyfans',     label: 'Best Onlyfans Groups',       count: 'Top 10 Onlyfans communities' },
  { slug: 'petite',       label: 'Best Petite Groups',         count: 'Top 10 Petite communities' },
  { slug: 'public',       label: 'Best Public Groups',         count: 'Top 10 Public communities' },
  { slug: 'russian',      label: 'Best Russian Groups',        count: 'Top 10 Russian communities' },
  { slug: 'spain',        label: 'Best Spain Groups',          count: 'Top 10 Spain communities' },
  { slug: 'telegram-porn',label: 'Best Telegram-Porn Groups',  count: 'Top 10 Telegram-Porn communities' },
  { slug: 'threesome',    label: 'Best Threesome Groups',      count: 'Top 10 Threesome communities' },
  { slug: 'uk',           label: 'Best UK Groups',             count: 'Top 10 UK communities' },
  { slug: 'usa',          label: 'Best USA Groups',            count: 'Top 10 USA communities' },
]

export default function BestTelegramGroupsPage() {
  return (
    <main style={{ padding: '48px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1 style={{ fontSize: 40, fontWeight: 900, color: '#f0f0f5', marginBottom: 8 }}>
          Curated <span style={{ color: '#e8356d' }}>Top Lists</span>
        </h1>
        <p style={{ color: '#9898aa', fontSize: 15 }}>
          Explore our hand-picked collections of the best Telegram groups for every category.
        </p>
      </div>

      <div className="top-lists-grid">
        {CATEGORIES.map(cat => (
          <Link
            key={cat.slug}
            href={`/best-telegram-groups/${cat.slug}`}
            className="card-hover tl-card"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#141417', border: '1px solid #2a2a32',
              borderRadius: 10, padding: '14px 16px',
              textDecoration: 'none', textAlign: 'left',
            }}
          >
            <div>
              <p className="tl-title" style={{ fontSize: 13, fontWeight: 600, color: '#f0f0f5', marginBottom: 2 }}>
                {cat.label}
              </p>
              <p className="tl-sub" style={{ fontSize: 11, color: '#9898aa' }}>{cat.count}</p>
            </div>
            <ChevronRight className="tl-chevron" size={14} style={{ color: '#9898aa', flexShrink: 0, marginLeft: 8 }} />
          </Link>
        ))}
      </div>
    </main>
  )
}
