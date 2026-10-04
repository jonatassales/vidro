import { HOME_LOCALE_LANG, isHomeLocale } from '@vidro/react/locale'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { siteMetadata, siteViewport } from '../metadata/page-metadata'
import { SiteDocument } from '../site-document'

export const metadata = siteMetadata
export const viewport = siteViewport

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isHomeLocale(locale)) notFound()

  return <SiteDocument lang={HOME_LOCALE_LANG[locale]}>{children}</SiteDocument>
}
