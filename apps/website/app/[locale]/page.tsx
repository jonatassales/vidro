import { HOME_LOCALES, isHomeLocale } from '@vidro/react/locale'
import type { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'
import { HomeExperience } from '../home.client'
import { pageMetadata, socialImages } from '../metadata/page-metadata'
import { WebsiteStructuredData } from '../metadata/structured-data'

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { locale } = await params
  if (!isHomeLocale(locale)) notFound()
  return pageMetadata('home', locale, await socialImages(parent))
}

export function generateStaticParams() {
  return HOME_LOCALES.map((locale) => ({ locale }))
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isHomeLocale(locale)) notFound()
  return (
    <>
      <WebsiteStructuredData locale={locale} />
      <HomeExperience locale={locale} />
    </>
  )
}
