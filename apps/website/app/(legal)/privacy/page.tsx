import { pageMetadata } from '../../metadata/page-metadata'
import { LegalContent } from '../legal-content'
import { privacyContent } from '../legal-documents'
import { LegalPage } from '../legal-page'

export const metadata = pageMetadata('privacy')

export default function Page() {
  return (
    <LegalPage eyebrow="Pending publication" title="Privacy">
      <LegalContent content={privacyContent} />
    </LegalPage>
  )
}
