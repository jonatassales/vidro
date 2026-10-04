import { HOME_LOCALES, isHomeLocale } from '@vidro/react/locale'
import { notFound } from 'next/navigation'
import { HomeExperience } from '../home.client'

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
  return <HomeExperience locale={locale} />
}
