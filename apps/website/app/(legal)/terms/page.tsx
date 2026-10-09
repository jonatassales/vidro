import { pageMetadata } from '../../metadata/page-metadata'
import { LegalContent } from '../legal-content'
import { termsContent } from '../legal-documents'
import { LegalPage } from '../legal-page'

export const metadata = pageMetadata('terms')

export default function Page() {
  return (
    <LegalPage eyebrow="Open source" title="Use & Support">
      <LegalContent content={termsContent} />
    </LegalPage>
  )
}
