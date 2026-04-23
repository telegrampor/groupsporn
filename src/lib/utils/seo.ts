const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL  || 'https://example.com'
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'TeleNSFW'
const YEAR      = new Date().getFullYear()

export function buildGroupMeta(group: {
  name: string
  slug: string
  description?: string
  seo_title?: string
  seo_description?: string
  thumbnail_url?: string
  member_count: number
  entity_type: string
  category_slug: string
  country: string
}) {
  const members = group.member_count > 0
    ? ` — ${fmt(group.member_count)} Members` : ''
  const type = group.entity_type === 'channel' ? 'Channel' : 'Group'

  const title = group.seo_title
    ?? `${group.name} Telegram ${type}${members} | ${SITE_NAME} ${YEAR}`

  const description = group.seo_description
    ?? `Join ${group.name} on Telegram. ${group.description
        ? group.description.slice(0, 110) + '…'
        : `Best ${group.category_slug} Telegram groups on ${SITE_NAME}.`}`

  const canonical = `${SITE_URL}/${group.slug}`
  const ogImage   = group.thumbnail_url ?? `${SITE_URL}/og-default.jpg`

  return {
    title,
    description: description.slice(0, 160),
    metadataBase: new URL(SITE_URL),
    alternates:   { canonical },
    openGraph: {
      title, description, url: canonical, siteName: SITE_NAME,
      images: [{ url: ogImage, width: 1200, height: 630, alt: group.name }],
      type: 'website' as const,
    },
    twitter: { card: 'summary_large_image' as const, title, description, images: [ogImage] },
    robots: {
      index: true, follow: true,
      'max-snippet': -1, 'max-image-preview': 'large' as const,
    },
  }
}

export function webPageSchema(group: {
  name: string; slug: string; description?: string;
  seo_description?: string; thumbnail_url?: string;
  published_at?: string; updated_at: string; category_slug: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type':    'WebPage',
    name:        group.name,
    description: group.seo_description ?? group.description,
    url:        `${SITE_URL}/${group.slug}`,
    image:       group.thumbnail_url,
    datePublished: group.published_at,
    dateModified:  group.updated_at,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home',   item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Groups', item: `${SITE_URL}/groups` },
        { '@type': 'ListItem', position: 3, name: cap(group.category_slug),
          item: `${SITE_URL}/best-telegram-groups/${group.category_slug}` },
        { '@type': 'ListItem', position: 4, name: group.name },
      ],
    },
  }
}

export function faqSchema(groupName: string) {
  return {
    '@context': 'https://schema.org',
    '@type':    'FAQPage',
    mainEntity: [
      { '@type': 'Question',
        name: `Is the ${groupName} Telegram group verified?`,
        acceptedAnswer: { '@type': 'Answer',
          text: `Yes. ${groupName} is manually verified by our team.` } },
      { '@type': 'Question',
        name: `How do I join ${groupName}?`,
        acceptedAnswer: { '@type': 'Answer',
          text: 'Click "Join Channel Now". You will be redirected to Telegram instantly.' } },
      { '@type': 'Question',
        name: 'Is it free?',
        acceptedAnswer: { '@type': 'Answer',
          text: 'Most groups are free. Some premium communities may require a Telegram subscription.' } },
    ],
  }
}

export const fmt = (n: number) =>
  n >= 1_000_000 ? `${(n/1_000_000).toFixed(1)}M`
  : n >= 1_000   ? `${(n/1_000).toFixed(1)}K`
  : String(n)

export const cap = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ')
