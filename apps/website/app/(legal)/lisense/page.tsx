import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pageMetadata } from '../../metadata/page-metadata'
import { LegalPage } from '../legal-page'

export const metadata = pageMetadata('lisense')

export default async function LicensePage() {
  const license = await readFile(
    resolve(process.cwd(), '../../packages/editor/LICENCE.md'),
    'utf8',
  )

  return (
    <LegalPage eyebrow="Open source" title="License">
      <p className="mb-6 text-muted">
        This is the license shipped with the Vidro editor package.
      </p>
      <pre className="whitespace-pre-wrap break-words rounded-2xl border border-line bg-white/70 p-6 font-mono text-xs leading-6 shadow-glass sm:p-8 sm:text-sm">
        {license}
      </pre>
    </LegalPage>
  )
}
