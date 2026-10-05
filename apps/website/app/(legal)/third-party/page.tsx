import { pageMetadata } from '../../metadata/page-metadata'
import { LegalContent } from '../legal-content'
import { thirdPartyContent } from '../legal-documents'
import { LegalPage } from '../legal-page'

export const metadata = pageMetadata('third-party')

export default function Page() {
  return (
    <LegalPage eyebrow="Review in progress" title="Third-Party Software">
      <LegalContent content={thirdPartyContent} />
    </LegalPage>
  )
}
