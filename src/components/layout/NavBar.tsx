'use client'

import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { Send, Lock, Sparkles, Search, Plus, LogIn, LogOut, Menu, X, FileText } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

export function NavBar() {
  const [open, setOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setOpen(false)
  }

  const userInitial = user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <header style={{
      background: '#0d0d0f',
      borderBottom: '1px solid #1f1f27',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto', padding: '0 20px',
        display: 'flex', alignItems: 'center', height: 64, gap: 8,
      }}>
        {/* Logo */}
        <Link href="/" style={{ marginRight: 12, flexShrink: 0, lineHeight: 0 }}>
          <Image
            src="/logo.png"
            alt="GroupsPorn"
            width={220}
            height={50}
            style={{ objectFit: 'contain', width: 'auto', height: 42 }}
          />
        </Link>

        {/* Desktop nav links */}
        <nav className="nav-desktop" style={{ alignItems: 'center', gap: 4, flex: 1 }}>
          <NavLink href="/#groups" icon={<Send size={13} />}>Groups</NavLink>
          <NavLink href="/bots"    icon={<Lock size={13} />}>Bots</NavLink>
          <NavLink href="/ainsfw"  icon={<Sparkles size={13} />}>🔞 AI NSFW</NavLink>
          <NavLink href="/onlyfanssearch" pill>OFsearch</NavLink>
          <NavLink href="/#articles" icon={<FileText size={13} />}>Articles</NavLink>
        </nav>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto', flexShrink: 0 }}>
          <Link href="/add" className="nav-add-btn" style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: '#e8356d', color: '#fff',
            padding: '6px 14px', borderRadius: 6,
            fontWeight: 700, fontSize: 13, textDecoration: 'none',
          }}>
            <Plus size={14} /> Add
          </Link>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} className="nav-login-btn">
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: '#e8356d', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
              }}>{userInitial}</div>
              <button onClick={handleLogout} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#9898aa', fontSize: 13, padding: 0,
              }}>
                <LogOut size={14} /> Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="nav-login-btn" style={{
              display: 'flex', alignItems: 'center', gap: 5,
              color: '#9898aa', fontSize: 13, textDecoration: 'none',
            }}>
              <LogIn size={14} /> Login
            </Link>
          )}

          <button onClick={() => setOpen(o => !o)} className="nav-mobile-btn" aria-label="Toggle menu" style={{
            background: 'none', border: 'none', color: '#f0f0f5',
            cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center',
          }}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div style={{ position: 'relative' }}>
            <button onClick={() => setLangOpen(o => !o)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 20, padding: 4, color: '#9898aa',
            }}>
              🇺🇸 <span style={{ fontSize: 11 }}>▾</span>
            </button>
            {langOpen && (
              <div style={{
                position: 'absolute', right: 0, top: '100%',
                background: '#1a1a1f', border: '1px solid #2a2a32',
                borderRadius: 8, padding: '8px 0', minWidth: 120, zIndex: 100,
              }}>
                {[['🇺🇸', 'English', '/'], ['🇩🇪', 'Deutsch', '/de/'], ['🇪🇸', 'Español', '/es/']].map(([flag, label, href]) => (
                  <Link key={href} href={href} onClick={() => setLangOpen(false)} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 16px', textDecoration: 'none',
                    color: '#f0f0f5', fontSize: 13,
                  }}>
                    {flag} {label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <nav style={{
          background: '#0d0d0f', borderTop: '1px solid #2a2a32',
          padding: '12px 16px 20px',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <p style={{ fontSize: 11, color: '#5a5a6e', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: '4px 0 8px' }}>EXPLORE</p>
          <MobileLink href="/#groups"    onClick={() => setOpen(false)} icon={<Send size={18} color="#0ea5e9" />}>Groups</MobileLink>
          <MobileLink href="/bots"       onClick={() => setOpen(false)} icon={<Lock size={18} color="#0ea5e9" />}>Bots</MobileLink>
          <MobileLink href="/ainsfw"     onClick={() => setOpen(false)} icon={<span style={{ fontSize: 18 }}>🔞</span>}>AI NSFW</MobileLink>
          <Link href="/onlyfanssearch" onClick={() => setOpen(false)} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '14px 16px', borderRadius: 8,
            background: '#fff', textDecoration: 'none', fontSize: 16, fontWeight: 700, color: '#0ea5e9',
          }}>
            <Search size={18} color="#0ea5e9" /> OFsearch
            <span style={{ marginLeft: 'auto', fontSize: 18 }}>→</span>
          </Link>
          <MobileLink href="/#articles" onClick={() => setOpen(false)} icon={<FileText size={18} color="#9898aa" />}>Articles</MobileLink>
          <div style={{ height: 1, background: '#2a2a32', margin: '4px 0' }} />
          <Link href="/add" onClick={() => setOpen(false)} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '14px 16px', borderRadius: 8, background: '#e8356d',
            textDecoration: 'none', fontSize: 16, fontWeight: 700, color: '#fff',
          }}>
            <Plus size={18} /> + Add
          </Link>
          <p style={{ fontSize: 11, color: '#5a5a6e', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: '8px 0 4px' }}>ACCOUNT</p>
          {user ? (
            <>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 8,
                background: '#141417', border: '1px solid #2a2a32', fontSize: 14, color: '#9898aa',
              }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e8356d', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>{userInitial}</div>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</span>
              </div>
              <button onClick={handleLogout} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 8,
                background: '#141417', border: '1px solid #2a2a32', cursor: 'pointer',
                fontSize: 16, fontWeight: 500, color: '#e8356d', width: '100%',
              }}>
                <LogOut size={18} color="#e8356d" /> Logout
              </button>
            </>
          ) : (
            <Link href="/login" onClick={() => setOpen(false)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 8,
              background: '#141417', border: '1px solid #2a2a32',
              textDecoration: 'none', fontSize: 16, fontWeight: 500, color: '#0ea5e9',
            }}>
              <LogIn size={18} color="#0ea5e9" /> Login
            </Link>
          )}
          <p style={{ fontSize: 11, color: '#5a5a6e', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: '8px 0 4px' }}>LANGUAGE</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {[['🇺🇸', 'EN', '/'], ['🇩🇪', 'DE', '/de/'], ['🇪🇸', 'ES', '/es/']].map(([flag, label, href]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 8,
                background: label === 'EN' ? '#2a2a32' : '#141417', border: '1px solid #2a2a32',
                textDecoration: 'none', fontSize: 13, color: '#f0f0f5', fontWeight: 600,
              }}>
                {flag} {label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}

function MobileLink({ href, children, icon, onClick }: { href: string; children: ReactNode; icon: ReactNode; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 8,
      background: '#141417', border: '1px solid #2a2a32',
      textDecoration: 'none', fontSize: 16, fontWeight: 500, color: '#f0f0f5',
    }}>
      {icon} {children}
    </Link>
  )
}

function NavLink({ href, children, icon, pill }: { href: string; children: ReactNode; icon?: ReactNode; pill?: boolean }) {
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
      color: '#9898aa', textDecoration: 'none', padding: '6px 10px', borderRadius: 8,
      fontSize: 13, fontWeight: 500, transition: 'color 0.15s', whiteSpace: 'nowrap',
    }}>
      {icon} {children}
    </Link>
  )
}
