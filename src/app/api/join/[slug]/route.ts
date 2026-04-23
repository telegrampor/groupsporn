import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase  = await createClient()

  const { data } = await supabase
    .from('groups')
    .select('telegram_url, click_count')
    .eq('slug', slug)
    .single()

  if (!data?.telegram_url) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Incrementa click (non-blocking)
  supabase.rpc('increment_group_click', { group_slug: slug }).then(() => {})

  return NextResponse.redirect(data.telegram_url, { status: 302 })
}
