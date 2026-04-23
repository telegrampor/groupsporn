import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, telegram_url, category, description, contact } = body

    if (!name?.trim() || !telegram_url?.trim() || !category?.trim()) {
      return NextResponse.json(
        { error: 'name, telegram_url and category are required' },
        { status: 400 }
      )
    }

    if (!/^https?:\/\/t\.me\//i.test(telegram_url)) {
      return NextResponse.json(
        { error: 'telegram_url must start with https://t.me/' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const baseSlug = slugify(name)
    const slug = `${baseSlug}-${Date.now().toString(36)}`

    const handle = telegram_url.replace(/^https?:\/\/t\.me\//i, '').replace(/\/$/, '')

    const { error } = await supabase.from('groups').insert({
      slug,
      name:             name.trim(),
      description:      description?.trim() || null,
      telegram_url:     telegram_url.trim(),
      telegram_handle:  handle,
      category_slug:    category.toLowerCase(),
      country:          'All',
      member_count:     0,
      view_count:       0,
      click_count:      0,
      is_featured:      false,
      is_premium:       false,
      is_verified:      false,
      is_new:           true,
      entity_type:      'group',
      status:           'pending',
      hidden:           true,
      broken:           false,
      indexing_status:  'submitted',
      quality_score:    0,
      source:           contact?.trim() || 'web-form',
      published_at:     null,
    })

    if (error) {
      console.error('[submit/group]', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ success: true, slug }, { status: 201 })
  } catch (err) {
    console.error('[submit/group]', err)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
