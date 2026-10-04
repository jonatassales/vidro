import type { MetadataRoute } from 'next'
import site from './metadata/site.json'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: site.name,
    short_name: site.name,
    start_url: '/',
    display: 'browser',
    background_color: site.themeColor,
    theme_color: site.themeColor,
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  }
}
