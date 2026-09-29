import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head, Search } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import { VidroLogo } from '@vidro/react'
import { isHomeLocale, type HomeLocale } from '@vidro/react/locale'
import { notFound } from 'next/navigation'
import { Suspense, type ReactNode } from 'react'
import { DocsLocaleChrome } from '../../components/docs-locale'
import { docsChrome } from '../../lib/chrome'

const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL ?? 'http://localhost:3000'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isHomeLocale(lang)) {
    return {}
  }
  const chrome = docsChrome[lang]
  return {
    title: {
      default: chrome.docsTitle,
      template: chrome.titleTemplate,
    },
    description: chrome.description,
  }
}

export default async function DocsLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!isHomeLocale(lang)) {
    notFound()
  }
  const locale: HomeLocale = lang
  const chrome = docsChrome[locale]

  const navbar = (
    <Navbar
      logo={
        <span className="inline-flex items-center gap-2 sm:gap-3">
          <a
            aria-label="Vidro website"
            className="inline-flex rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            href={`${websiteUrl}?locale=${locale}`}
          >
            <VidroLogo />
          </a>
          <Suspense fallback={null}>
            <DocsLocaleChrome lang={locale} />
          </Suspense>
        </span>
      }
      logoLink={false}
    >
      <a className="text-sm font-medium text-foreground" href={`${websiteUrl}?locale=${locale}`}>
        {chrome.website}
      </a>
      <a className="text-sm font-medium text-foreground" href="https://github.com/jonatassales/vidro">
        {chrome.github}
      </a>
    </Navbar>
  )

  return (
    <>
      <Head backgroundColor={{ dark: '#F8FBFC', light: '#F8FBFC' }} color={{ hue: 200, saturation: 10 }} />
      <Layout
        darkMode={false}
        docsRepositoryBase="https://github.com/jonatassales/vidro/tree/main/apps/docs"
        editLink={chrome.edit}
        feedback={{ content: chrome.feedback }}
        footer={<Footer>{chrome.footer}</Footer>}
        navbar={navbar}
        nextThemes={{ defaultTheme: 'light', forcedTheme: 'light' }}
        pageMap={await getPageMap(`/${locale}`)}
        search={<Search emptyResult={chrome.searchEmpty} placeholder={chrome.search} />}
      >
        {children}
      </Layout>
    </>
  )
}
