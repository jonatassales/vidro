import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google'
import type { ReactNode } from 'react'
import './globals.css'

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

export function SiteDocument({
  children,
  lang,
}: {
  children: ReactNode
  lang: string
}) {
  return (
    <html className={`${plexSans.variable} ${plexMono.variable}`} lang={lang}>
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}
