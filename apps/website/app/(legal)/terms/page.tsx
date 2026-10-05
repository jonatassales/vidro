import { pageMetadata } from '../../metadata/page-metadata'
import { LegalContent } from '../legal-content'
import { termsContent } from '../legal-documents'
import { LegalPage } from '../legal-page'

export const metadata = pageMetadata('terms')

export default function Page() {
  return (
    <LegalPage eyebrow="Pending publication" title="Terms of Sale">
      <LegalContent content={termsContent} />
    </LegalPage>
  )
}
