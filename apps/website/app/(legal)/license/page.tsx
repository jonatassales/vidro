import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pageMetadata } from '../../metadata/page-metadata'
import { LegalContent } from '../legal-content'
import { LegalPage } from '../legal-page'

export const metadata = pageMetadata('license')

export default async function LicensePage() {
  const license = await readFile(
    resolve(process.cwd(), '../../packages/editor/LICENCE.md'),
    'utf8',
  )

  return (
    <LegalPage eyebrow="Interim proprietary notice" title="License">
      <LegalContent content={license} />
    </LegalPage>
  )
}
