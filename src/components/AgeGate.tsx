'use client'

import { useState, useEffect } from 'react'

export function AgeGate() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('age-confirmed')) setShow(true)
  }, [])

  if (!show) return null

  function confirm() {
    localStorage.setItem('age-confirmed', '1')
    setShow(false)
  }

  function leave() {
    window.location.href = 'https://www.google.com'
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.93)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        background: '#141417', border: '1px solid #2a2a32',
        borderRadius: 16, padding: '40px 28px',
        maxWidth: 400, width: '100%', textAlign: 'center',
      }}>
        <p style={{ fontSize: 11, letterSpacing: 2, color: '#9898aa', fontWeight: 700, marginBottom: 16, textTransform: 'uppercase' }}>
          {process.env.NEXT_PUBLIC_SITE_NAME || 'GroupsPorn'}.PRO
        </p>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#f0f0f5', marginBottom: 10, lineHeight: 1.3 }}>
          This website contains Adult and NSFW content.
        </h2>
        <p style={{ fontSize: 14, color: '#9898aa', marginBottom: 28 }}>
          You must be 18 or older to enter.
        </p>
        <button
          onClick={confirm}
          style={{
            display: 'block', width: '100%',
            background: '#e8356d', color: '#fff',
            padding: '14px', borderRadius: 8,
            fontWeight: 700, fontSize: 15, border: 'none',
            cursor: 'pointer', marginBottom: 10,
          }}
        >
          I am 18 or older — Enter
        </button>
        <button
          onClick={leave}
          style={{
            display: 'block', width: '100%',
            background: '#1a1a1f', color: '#9898aa',
            padding: '14px', borderRadius: 8,
            fontWeight: 500, fontSize: 14,
            border: '1px solid #2a2a32', cursor: 'pointer',
          }}
        >
          I am under 18 — Leave
        </button>
      </div>
    </div>
  )
}
