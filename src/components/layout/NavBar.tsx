'use client'

import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export function NavBar() {
  const [open, setOpen]   = useState(false)
  const [user, setUser]   = useState<User | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null))
    return () => subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await createClient().auth.signOut()
    setOpen(false)
  }

  const userInitial = user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#0d0d0d]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">

        {/* ── Logo ── */}
        <Link href="/" className="flex-shrink-0">
          <span className="text-xl font-bold tracking-tight">
            <span className="text-white">ERO</span><span className="text-red-500">gram</span>
          </span>
        </Link>

        {/* ── Desktop nav ── */}
        <div className="hidden md:flex items-center gap-1.5 lg:gap-2">
          <NavLink href="/groups" color="blue">
            <TgIcon /> Groups
          </NavLink>
          <NavLink href="/bots" color="blue">
            <BotIcon /> Bots
          </NavLink>
          <NavLink href="/ainsfw" color="blue">
            🔞 AI NSFW
          </NavLink>

          {/* OFsearch — white pill */}
          <Link href="/onlyfanssearch"
            className="inline-block px-3.5 py-1.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 shadow-sm transition-all whitespace-nowrap">
            <span className="text-sm font-bold text-[#00AFF0]">OFsearch</span>
          </Link>

          {/* Articles — subtle white */}
          <Link href="/#articles"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all whitespace-nowrap text-white/80 bg-white/[0.07] border border-white/[0.10] hover:bg-white/[0.13] hover:text-white">
            📰 Articles
          </Link>
        </div>

        {/* ── Right actions ── */}
        <div className="flex items-center gap-2">
          <Link href="/add"
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[13px] font-semibold text-[#4ab3f4] bg-[#0088cc]/[0.10] border border-[#0088cc]/25 hover:bg-[#0088cc]/[0.18] hover:text-[#6ec6f7] transition-all whitespace-nowrap">
            ＋ Add
          </Link>

          {user ? (
            <div className="hidden md:flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#b31b1b] text-white text-xs font-bold flex items-center justify-center">
                {userInitial}
              </div>
              <button onClick={handleLogout}
                className="text-[13px] text-[#999] hover:text-white transition-colors">
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login"
              className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[13px] font-semibold text-[#4ab3f4] bg-[#0088cc]/[0.10] border border-[#0088cc]/25 hover:bg-[#0088cc]/[0.18] hover:text-[#6ec6f7] transition-all whitespace-nowrap">
              Login
            </Link>
          )}

          {/* Hamburger */}
          <button onClick={() => setOpen(o => !o)}
            className="md:hidden flex flex-col gap-1.5 p-1.5 rounded-md"
            aria-label="Toggle menu">
            <span className={`w-5 h-0.5 bg-white/70 rounded-full transition-all ${open ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`w-5 h-0.5 bg-white/70 rounded-full transition-all ${open ? 'opacity-0' : ''}`} />
            <span className={`w-5 h-0.5 bg-white/70 rounded-full transition-all ${open ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${open ? 'max-h-screen' : 'max-h-0'}`}>
        <div className="px-4 pb-6 pt-2 flex flex-col gap-2 border-t border-white/[0.06] bg-[#0d0d0d]">

          <p className="px-1 text-[10px] font-black uppercase tracking-widest text-white/25 mt-2 mb-1">Explore</p>

          <MobileLink href="/groups" onClick={() => setOpen(false)}>
            <TgIcon /> Groups
          </MobileLink>
          <MobileLink href="/bots" onClick={() => setOpen(false)}>
            <BotIcon /> Bots
          </MobileLink>
          <MobileLink href="/ainsfw" onClick={() => setOpen(false)}>
            🔞 AI NSFW
          </MobileLink>

          <Link href="/onlyfanssearch" onClick={() => setOpen(false)}
            className="flex items-center justify-between px-4 py-2.5 rounded-lg text-[14px] bg-white border border-gray-200 font-bold">
            <span className="text-[#00AFF0]">OFsearch</span>
            <span className="text-[#999] text-xs">+1.8M creators →</span>
          </Link>

          <MobileLink href="/#articles" onClick={() => setOpen(false)}>
            📰 Articles
          </MobileLink>

          <div className="h-px bg-white/[0.06] my-1" />

          <Link href="/add" onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[14px] font-bold bg-[#b31b1b] text-white">
            ＋ Add Listing
          </Link>

          <p className="px-1 text-[10px] font-black uppercase tracking-widest text-white/25 mt-2 mb-1">Account</p>

          {user ? (
            <>
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-[#999]">
                <div className="w-8 h-8 rounded-full bg-[#b31b1b] text-white text-sm font-bold flex items-center justify-center shrink-0">
                  {userInitial}
                </div>
                <span className="truncate">{user.email}</span>
              </div>
              <button onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[14px] font-semibold bg-white/5 border border-white/10 text-[#b31b1b] w-full">
                Logout
              </button>
            </>
          ) : (
            <MobileLink href="/login" onClick={() => setOpen(false)}>
              Login
            </MobileLink>
          )}

          <p className="px-1 text-[10px] font-black uppercase tracking-widest text-white/25 mt-2 mb-1">Language</p>
          <div className="flex gap-2">
            {([['🇺🇸', 'EN', '/'], ['🇩🇪', 'DE', '/de/'], ['🇪🇸', 'ES', '/es/']] as const).map(([flag, label, href]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                  label === 'EN' ? 'bg-white/10 text-white' : 'bg-white/5 text-white/50 hover:text-white'
                }`}>
                {flag} {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}

function NavLink({ href, children, color = 'blue' }: {
  href: string; children: React.ReactNode; color?: 'blue' | 'white'
}) {
  return (
    <Link href={href}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold text-[#4ab3f4] bg-[#0088cc]/[0.10] border border-[#0088cc]/25 hover:bg-[#0088cc]/[0.18] hover:text-[#6ec6f7] transition-all whitespace-nowrap">
      {children}
    </Link>
  )
}

function MobileLink({ href, children, onClick }: {
  href: string; children: React.ReactNode; onClick: () => void
}) {
  return (
    <Link href={href} onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[14px] font-semibold text-[#4ab3f4] bg-[#0088cc]/[0.10] border border-[#0088cc]/25 hover:bg-[#0088cc]/[0.18] hover:text-[#6ec6f7] transition-all">
      {children}
    </Link>
  )
}

function TgIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-2.02 9.532c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.21 14.238l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.606.348z" />
    </svg>
  )
}

function BotIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7H3a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2zM7 14v4h10v-4H7zM9 16a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm6 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
    </svg>
  )
}
