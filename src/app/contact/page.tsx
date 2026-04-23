'use client'

import { useState } from 'react'
import type { Metadata } from 'next'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    await new Promise(r => setTimeout(r, 1000))
    setStatus('success')
  }

  if (status === 'success') {
    return (
      <main style={{ minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>📨</p>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#f0f0f5', marginBottom: 8 }}>Message Sent!</h2>
          <p style={{ color: '#9898aa' }}>We'll get back to you as soon as possible.</p>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: 'calc(100vh - 56px)', padding: '60px 24px' }}>
      <div style={{ maxWidth: 540, margin: '0 auto' }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#f0f0f5', marginBottom: 6 }}>Contact & Support</h1>
        <p style={{ color: '#9898aa', fontSize: 14, marginBottom: 36 }}>
          Have a question or need help? Fill out the form and we'll respond promptly.
        </p>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Name *"><input required placeholder="Your name" value={form.name} onChange={e => set('name', e.target.value)} /></Field>
            <Field label="Email *"><input required type="email" placeholder="your@email.com" value={form.email} onChange={e => set('email', e.target.value)} /></Field>
          </div>
          <Field label="Subject *">
            <select required value={form.subject} onChange={e => set('subject', e.target.value)}>
              <option value="">Select a subject</option>
              <option value="support">General Support</option>
              <option value="report">Report Content</option>
              <option value="advertise">Advertising</option>
              <option value="partnership">Partnership</option>
              <option value="dmca">DMCA / Copyright</option>
              <option value="other">Other</option>
            </select>
          </Field>
          <Field label="Message *">
            <textarea required placeholder="Describe your issue or question…" value={form.message} onChange={e => set('message', e.target.value)} rows={5} />
          </Field>

          <button
            type="submit"
            disabled={status === 'loading'}
            style={{
              background: '#e8356d', color: '#fff', border: 'none',
              padding: '14px', borderRadius: 8, fontWeight: 700, fontSize: 15,
              cursor: 'pointer', marginTop: 4, opacity: status === 'loading' ? 0.7 : 1,
            }}
          >
            {status === 'loading' ? 'Sending…' : 'Send Message'}
          </button>
        </form>

        <style>{`
          .cf input, .cf select, .cf textarea {
            width: 100%; background: #141417; border: 1px solid #2a2a32;
            color: #f0f0f5; padding: 10px 14px; border-radius: 8px;
            font-size: 14px; outline: none; font-family: inherit; resize: vertical;
          }
          .cf input:focus, .cf select:focus, .cf textarea:focus { border-color: #e8356d; }
          .cf select option { background: #141417; }
        `}</style>
      </div>
    </main>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#f0f0f5', marginBottom: 6 }}>{label}</label>
      <div className="cf">{children}</div>
    </div>
  )
}
