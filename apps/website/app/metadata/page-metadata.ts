import { HOME_LOCALES, type HomeLocale } from '@vidro/react/locale'
import type { Metadata, ResolvingMetadata, Viewport } from 'next'
import locales from './locales.json'
import pages from './pages.json'
import site from './site.json'

type PageId = keyof typeof pages
export const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? site.url)

export function absolute(pathname: string) {
  return new URL(pathname, siteUrl).toString()
}

export function homePath(locale: HomeLocale) {
  return `/${locale}/`
}

export function homeLanguages() {
  return {
    ...Object.fromEntries(
      HOME_LOCALES.map((locale) => [locale, absolute(homePath(locale))]),
    ),
    'x-default': absolute('/'),
  }
}

const indexRobots: Metadata['robots'] = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
}
const imageAlt =
  'Vidro — A clear view of your code. A Web Component code editor.'
const openGraphImage = {
  url: absolute('/opengraph-image'),
  width: 1200,
  height: 630,
  alt: imageAlt,
}
const twitterImage = { ...openGraphImage, url: absolute('/twitter-image') }

export const siteMetadata: Metadata = {
  metadataBase: siteUrl,
  applicationName: site.name,
  title: pages.home.en.title,
  description: pages.home.en.description,
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    siteName: site.name,
    title: pages.home.en.title,
    description: pages.home.en.description,
    images: [openGraphImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: pages.home.en.title,
    description: pages.home.en.description,
    images: [twitterImage],
  },
}

export const siteViewport: Viewport = {
  colorScheme: 'light',
  themeColor: site.themeColor,
}

interface SocialImages {
  openGraph?: NonNullable<Awaited<ResolvingMetadata>['openGraph']>['images']
  twitter?: NonNullable<Awaited<ResolvingMetadata>['twitter']>['images']
}

export async function socialImages(parent: ResolvingMetadata) {
  const resolved = await parent
  return {
    openGraph: resolved.openGraph?.images ?? [openGraphImage],
    twitter: resolved.twitter?.images ?? [twitterImage],
  }
}

export function pageMetadata(
  page: PageId,
  locale: HomeLocale = 'en',
  images?: SocialImages,
): Metadata {
  const copy = page === 'home' ? pages.home[locale] : pages[page].en
  const canonical = absolute(page === 'home' ? homePath(locale) : `/${page}/`)
  const pageLocale = page === 'home' ? locale : 'en'

  return {
    title: { absolute: copy.title },
    description: copy.description,
    alternates: {
      canonical,
      ...(page === 'home' ? { languages: homeLanguages() } : {}),
    },
    openGraph: {
      type: 'website',
      siteName: site.name,
      title: copy.title,
      description: copy.description,
      url: canonical,
      locale: locales[pageLocale].openGraphLocale,
      ...(page === 'home'
        ? {
            alternateLocale: HOME_LOCALES.filter(
              (other) => other !== locale,
            ).map((other) => locales[other].openGraphLocale),
          }
        : {}),
      images: images?.openGraph ?? [openGraphImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: copy.title,
      description: copy.description,
      images: images?.twitter ?? [twitterImage],
    },
    robots: page === 'policies' ? { index: false, follow: false } : indexRobots,
  }
}
