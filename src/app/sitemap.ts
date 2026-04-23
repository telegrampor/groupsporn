import { MetadataRoute } from 'next'
import { getAllPublishedSlugs } from '@/lib/supabase/queries/groups'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getAllPublishedSlugs()

  const static_routes: MetadataRoute.Sitemap = [
    { url: SITE_URL,                              lastModified: new Date(), changeFrequency: 'daily',  priority: 1.0 },
    { url: `${SITE_URL}/groups`,                  lastModified: new Date(), changeFrequency: 'daily',  priority: 0.9 },
    { url: `${SITE_URL}/bots`,                    lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/ainsfw`,                  lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/articles`,                lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/best-telegram-groups`,    lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  ]

  const group_routes: MetadataRoute.Sitemap = slugs.map(g => ({
    url:             `${SITE_URL}/${g.slug}`,
    lastModified:    new Date(g.updated_at),
    changeFrequency: 'weekly',
    priority:        0.7,
  }))

  return [...static_routes, ...group_routes]
}
