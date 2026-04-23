'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

interface Category {
  slug:  string   // lowercase-dashed, matches DB category_slug exactly
  label: string   // display name
}

export function GroupsFilters({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const params = useSearchParams()

  const update = useCallback((key: string, value: string) => {
    const q = new URLSearchParams(params.toString())
    if (value) q.set(key, value)
    else q.delete(key)
    q.delete('page')
    router.push(`/groups?${q.toString()}`)
  }, [params, router])

  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
      {/* Category — value is the DB slug, label is the display name */}
      <select
        value={params.get('category') ?? ''}
        onChange={e => update('category', e.target.value)}
        style={selectStyle}
      >
        <option value="">All Categories</option>
        {categories.map(c => (
          <option key={c.slug} value={c.slug}>{c.label}</option>
        ))}
      </select>

      {/* Sort */}
      <select
        value={params.get('sort') ?? 'newest'}
        onChange={e => update('sort', e.target.value)}
        style={selectStyle}
      >
        <option value="newest">Newest</option>
        <option value="popular">Most Viewed</option>
        <option value="members">Most Members</option>
      </select>

      {/* Search — fires on Enter */}
      <input
        type="search"
        placeholder="Search groups…"
        defaultValue={params.get('search') ?? ''}
        onKeyDown={e => {
          if (e.key === 'Enter') update('search', (e.target as HTMLInputElement).value.trim())
        }}
        style={{ ...selectStyle, minWidth: 180 }}
      />
    </div>
  )
}

const selectStyle: React.CSSProperties = {
  background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)',
  color: '#f5f5f5', padding: '8px 14px', borderRadius: 8,
  fontSize: 13, outline: 'none', cursor: 'pointer',
}
