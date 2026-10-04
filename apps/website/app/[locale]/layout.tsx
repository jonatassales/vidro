import { HOME_LOCALE_LANG, isHomeLocale } from '@vidro/react/locale'
import type { Metadata } from 'next'
import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import '../globals.css'

const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-sans',
})

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vidro.pro'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Vidro — A clear view of your code.',
  description:
    'An embeddable code editor with four presets, crisp syntax highlighting, and subtle glass styling.',
  openGraph: {
    title: 'Vidro — A clear view of your code.',
    description:
      'An embeddable code editor with four presets, crisp syntax highlighting, and subtle glass styling.',
    type: 'website',
    siteName: 'Vidro',
  },
}

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isHomeLocale(locale)) notFound()

  return (
    <html className={`${plexSans.variable} ${plexMono.variable}`} lang={HOME_LOCALE_LANG[locale]}>
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}
