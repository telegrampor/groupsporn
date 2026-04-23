'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { Send, Lock, Sparkles, Search, Plus, LogIn, Menu, X } from 'lucide-react'
import Image from 'next/image'

export function NavBar() {
  const [open, setOpen] = useState(false)

  return (
    <header style={{
      background: '#0d0d0f',
      borderBottom: '1px solid #1f1f27',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto', padding: '0 20px',
        display: 'flex', alignItems: 'center', height: 56, gap: 8,
      }}>
        {/* Logo */}
        <Link href="/" style={{ marginRight: 12, flexShrink: 0, lineHeight: 0 }}>
          <Image src="/logo.png" alt="GroupsPorn" width={180} height={40} style={{ objectFit: 'contain' }} />
        </Link>

        {/* Desktop nav links */}
        <nav className="nav-desktop" style={{ alignItems: 'center', gap: 4, flex: 1 }}>
          <NavLink href="/groups" icon={<Send size={13} />}>Groups</NavLink>
          <NavLink href="/bots" icon={<Lock size={13} />}>Bots</NavLink>
          <NavLink href="/ainsfw" icon={<Sparkles size={13} />}>🔞 AI NSFW</NavLink>
          <NavLink href="/ofsearch" pill>OFsearch</NavLink>
          <NavLink href="/articles">Articles</NavLink>
        </nav>

        {/* Right actions */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginLeft: 'auto', flexShrink: 0,
        }}>
          {/* Desktop only */}
          <Link href="/add" className="nav-add-btn" style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: '#e8356d', color: '#fff',
            padding: '6px 14px', borderRadius: 6,
            fontWeight: 700, fontSize: 13, textDecoration: 'none',
          }}>
            <Plus size={14} /> Add
          </Link>

          <Link href="/login" className="nav-login-btn" style={{
            display: 'flex', alignItems: 'center', gap: 5,
            color: '#9898aa', fontSize: 13, textDecoration: 'none',
          }}>
            <LogIn size={14} /> Login
          </Link>

          {/* Hamburger — shown on mobile, hidden on desktop via CSS */}
          <button
            onClick={() => setOpen(o => !o)}
            className="nav-mobile-btn"
            aria-label="Toggle menu"
            style={{
              background: 'none', border: 'none', color: '#f0f0f5',
              cursor: 'pointer', padding: 4,
              display: 'flex', alignItems: 'center',
            }}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Flag — visible on BOTH desktop and mobile */}
          <span className="nav-flag" style={{
            display: 'flex', alignItems: 'center',
            fontSize: 20, cursor: 'pointer', userSelect: 'none',
          }} title="Language: English">
            🇺🇸
          </span>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <nav style={{
          background: '#141417', borderTop: '1px solid #2a2a32',
          padding: '12px 16px',
          display: 'flex', flexDirection: 'column', gap: 2,
        }}>
          {([
            ['/groups',   'Groups'],
            ['/bots',     'Bots'],
            ['/ainsfw',   '🔞 AI NSFW'],
            ['/ofsearch', 'OFsearch'],
            ['/articles', 'Articles'],
            ['/add',      '+ Add Group'],
            ['/login',    'Login'],
          ] as [string, string][]).map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} style={{
              color: '#f0f0f5', textDecoration: 'none',
              padding: '10px 14px', borderRadius: 8,
              fontSize: 15, fontWeight: 500,
            }}>
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}

function NavLink({
  href, children, icon, pill,
}: {
  href: string
  children: ReactNode
  icon?: ReactNode
  pill?: boolean
}) {
  if (pill) {
    return (
      <Link href={href} style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        background: '#ffffff', color: '#0d0d0f',
        padding: '4px 12px', borderRadius: 999,
        fontWeight: 700, fontSize: 13, textDecoration: 'none', flexShrink: 0,
      }}>
        <Search size={12} /> {children}
      </Link>
    )
  }
  return (
    <Link href={href} className="nav-link" style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      color: '#9898aa', textDecoration: 'none',
      padding: '6px 10px', borderRadius: 8,
      fontSize: 13, fontWeight: 500, transition: 'color 0.15s',
      whiteSpace: 'nowrap',
    }}>
      {icon} {children}
    </Link>
  )
}
