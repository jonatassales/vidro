import type { ReactNode } from 'react'
import { siteMetadata, siteViewport } from '../metadata/page-metadata'
import { SiteDocument } from '../site-document'

export const metadata = siteMetadata
export const viewport = siteViewport

export default function LegalLayout({ children }: { children: ReactNode }) {
  return <SiteDocument lang="en">{children}</SiteDocument>
}
