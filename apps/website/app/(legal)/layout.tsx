import type { ReactNode } from 'react'
import { SiteDocument, siteMetadata } from '../site-document'

export const metadata = siteMetadata

export default function LegalLayout({ children }: { children: ReactNode }) {
  return <SiteDocument lang="en">{children}</SiteDocument>
}
