'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Send } from 'lucide-react'

export default function AddGroupPage() {
  const [form, setForm] = useState({ name: '', telegram_url: '', category: '', description: '', contact: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      await fetch('/api/submit/group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <main style={{ minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#f0f0f5', marginBottom: 8 }}>Submission Received!</h2>
          <p style={{ color: '#9898aa', marginBottom: 24 }}>Your group will be reviewed and published within 24–48 hours.</p>
          <Link href="/" style={{ background: '#e8356d', color: '#fff', padding: '12px 24px', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>
            Back to Home
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: 'calc(100vh - 56px)', padding: '48px 24px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <Link href="/add" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#9898aa', textDecoration: 'none', fontSize: 13, marginBottom: 32 }}>
          <ChevronLeft size={16} /> Back
        </Link>

        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f0f0f5', marginBottom: 6 }}>
          Submit Telegram Group
        </h1>
        <p style={{ fontSize: 14, color: '#9898aa', marginBottom: 32 }}>
          Fill out the form below. Our team will review and publish within 24–48 hours.
        </p>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Group / Channel Name *" required>
            <input required placeholder="e.g. Best Amateur NSFW" value={form.name} onChange={e => set('name', e.target.value)} />
          </Field>

          <Field label="Telegram Link *" required>
            <input required placeholder="https://t.me/your_group" value={form.telegram_url} onChange={e => set('telegram_url', e.target.value)} />
          </Field>

          <Field label="Category *" required>
            <select required value={form.category} onChange={e => set('category', e.target.value)}>
              <option value="">Select a category</option>
              {['Amateur','Anal','Anime','Asian','BDSM','Big Ass','Big Tits','Blowjob','Cosplay','Ebony','Feet','Fetish','Latina','Lesbian','MILF','Onlyfans','Threesome','Other'].map(c => (
                <option key={c} value={c.toLowerCase()}>{c}</option>
              ))}
            </select>
          </Field>

          <Field label="Description">
            <textarea placeholder="Describe your group briefly (optional)" value={form.description} onChange={e => set('description', e.target.value)} rows={3} />
          </Field>

          <Field label="Contact (Email or Telegram)">
            <input placeholder="your@email.com or @username" value={form.contact} onChange={e => set('contact', e.target.value)} />
          </Field>

          <button
            type="submit"
            disabled={status === 'loading'}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: '#e8356d', color: '#fff', border: 'none',
              padding: '14px', borderRadius: 8, fontWeight: 700, fontSize: 15,
              cursor: 'pointer', marginTop: 8, opacity: status === 'loading' ? 0.7 : 1,
            }}
          >
            <Send size={16} />
            {status === 'loading' ? 'Submitting…' : 'Submit Group'}
          </button>

          {status === 'error' && (
            <p style={{ color: '#e8356d', fontSize: 13, textAlign: 'center' }}>
              Something went wrong. Please try again.
            </p>
          )}
        </form>
      </div>
    </main>
  )
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#f0f0f5', marginBottom: 6 }}>
        {label}
      </label>
      <style>{`
        .add-form input, .add-form select, .add-form textarea {
          width: 100%; background: #141417; border: 1px solid #2a2a32;
          color: #f0f0f5; padding: 10px 14px; border-radius: 8px;
          font-size: 14px; outline: none; font-family: inherit;
          transition: border-color 0.15s;
        }
        .add-form input:focus, .add-form select:focus, .add-form textarea:focus {
          border-color: #e8356d;
        }
        .add-form select option { background: #141417; }
      `}</style>
      <div className="add-form">{children}</div>
    </div>
  )
}
