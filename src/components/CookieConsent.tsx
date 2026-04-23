'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export function CookieConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('cookie-consent')) setShow(true)
  }, [])

  if (!show) return null

  function accept() {
    localStorage.setItem('cookie-consent', 'accepted')
    setShow(false)
  }

  function decline() {
    localStorage.setItem('cookie-consent', 'declined')
    setShow(false)
  }

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9000,
      background: '#141417', borderTop: '1px solid #2a2a32',
      padding: '14px 20px',
      display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
    }}>
      <p style={{ fontSize: 13, color: '#9898aa', margin: 0, flex: 1, minWidth: 200 }}>
        We use cookies to improve your experience and analyze site traffic.{' '}
        <Link href="/privacy" style={{ color: '#0ea5e9', textDecoration: 'none' }}>
          Privacy Policy
        </Link>
      </p>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button
          onClick={decline}
          style={{
            background: 'none', border: '1px solid #2a2a32',
            color: '#9898aa', padding: '6px 16px', borderRadius: 6,
            fontSize: 13, cursor: 'pointer', fontWeight: 500,
          }}
        >
          Decline
        </button>
        <button
          onClick={accept}
          style={{
            background: '#e8356d', border: 'none',
            color: '#fff', padding: '6px 16px', borderRadius: 6,
            fontSize: 13, cursor: 'pointer', fontWeight: 600,
          }}
        >
          Accept
        </button>
      </div>
    </div>
  )
}
