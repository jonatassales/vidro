import { pageMetadata } from '../../metadata/page-metadata'
import { LegalContent } from '../legal-content'
import { policiesContent } from '../legal-documents'
import { LegalPage } from '../legal-page'

export const metadata = pageMetadata('policies')

export default function Page() {
  return (
    <LegalPage eyebrow="Legal documents" title="Legal & Policies">
      <LegalContent content={policiesContent} />
    </LegalPage>
  )
}
