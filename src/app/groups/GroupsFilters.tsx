'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export function GroupsFilters({ categories }: { categories: string[] }) {
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
      {/* Category */}
      <select
        value={params.get('category') ?? ''}
        onChange={e => update('category', e.target.value)}
        style={selectStyle}
      >
        <option value="">All Categories</option>
        {categories.map(c => (
          <option key={c} value={c.toLowerCase()}>{c}</option>
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

      {/* Search */}
      <input
        type="search"
        placeholder="Search groups…"
        defaultValue={params.get('search') ?? ''}
        onKeyDown={e => {
          if (e.key === 'Enter') update('search', (e.target as HTMLInputElement).value)
        }}
        style={{
          ...selectStyle,
          minWidth: 180,
        }}
      />
    </div>
  )
}

const selectStyle: React.CSSProperties = {
  background: '#141417', border: '1px solid #2a2a32',
  color: '#f0f0f5', padding: '8px 14px', borderRadius: 8,
  fontSize: 13, outline: 'none', cursor: 'pointer',
}
