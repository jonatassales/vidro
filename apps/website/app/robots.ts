import type { MetadataRoute } from 'next'
import { absolute } from './metadata/page-metadata'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
    sitemap: absolute('/sitemap.xml'),
  }
}
