'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Metadata } from 'next'

export default function LoginPage() {
  const router = useRouter()

  async function signInWithGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <main style={{
      minHeight: 'calc(100vh - 56px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 16px',
    }}>
      <div style={{
        background: '#141417', border: '1px solid #2a2a32',
        borderRadius: 16, padding: '40px 32px',
        maxWidth: 400, width: '100%', textAlign: 'center',
      }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f0f0f5', marginBottom: 8 }}>
          Login to {process.env.NEXT_PUBLIC_SITE_NAME || 'GroupsPorn'}
        </h1>
        <p style={{ fontSize: 14, color: '#9898aa', marginBottom: 32 }}>
          Login to discover amazing groups
        </p>

        <button
          onClick={signInWithGoogle}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            width: '100%', padding: '13px 20px', borderRadius: 8,
            background: '#fff', color: '#0d0d0f',
            fontWeight: 600, fontSize: 15, border: 'none', cursor: 'pointer',
            marginBottom: 12,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </button>

        <p style={{ fontSize: 12, color: '#5a5a6e', marginTop: 24 }}>
          By logging in, you agree to our{' '}
          <Link href="/privacy" style={{ color: '#0ea5e9', textDecoration: 'none' }}>Privacy Policy</Link>
        </p>
      </div>
    </main>
  )
}
