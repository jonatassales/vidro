import { HOME_LOCALES } from '@vidro/react/locale'
import type { MetadataRoute } from 'next'
import { absolute, homeLanguages, homePath } from './metadata/page-metadata'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...HOME_LOCALES.map((locale) => ({
      url: absolute(homePath(locale)),
      alternates: { languages: homeLanguages() },
    })),
    { url: absolute('/license/') },
    { url: absolute('/policies/') },
  ]
}
