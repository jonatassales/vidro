import type { HomeLocale } from '@vidro/react/locale'
import organization from './organization.json'
import { absolute, homePath } from './page-metadata'
import pages from './pages.json'
import site from './site.json'

export function WebsiteStructuredData({ locale }: { locale: HomeLocale }) {
  const copy = pages.home[locale]
  const canonical = absolute(homePath(locale))
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      organization,
      {
        '@type': 'WebSite',
        '@id': absolute('/#website'),
        name: site.name,
        url: absolute('/'),
        inLanguage: locale,
        publisher: { '@id': organization['@id'] },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': absolute('/#editor'),
        name: site.name,
        description: copy.description,
        url: canonical,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Web browser',
        inLanguage: locale,
        image: absolute('/opengraph-image'),
        license: absolute('/lisense/'),
        sameAs: site.repository,
        publisher: { '@id': organization['@id'] },
        offers: {
          '@type': 'Offer',
          price: '1',
          priceCurrency: 'USD',
          url: `${canonical}#pricing`,
        },
      },
    ],
  }

  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD uses local metadata and escapes every less-than character.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
      type="application/ld+json"
    />
  )
}
