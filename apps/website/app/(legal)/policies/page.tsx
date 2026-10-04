import type { Metadata } from 'next'
import { LegalPage } from '../legal-page'

export const metadata: Metadata = {
  title: 'Policies — Vidro',
  description: 'Placeholder for upcoming Vidro website policies.',
  robots: { index: false, follow: false },
}

export default function PoliciesPage() {
  return (
    <LegalPage eyebrow="Draft" title="Policies">
      <p className="mb-8 rounded-xl border border-line bg-ice/40 px-5 py-4 font-medium text-foreground">
        Placeholder content. The Vidro website policies will be provided later;
        the text below is not a published policy.
      </p>
      <p className="mb-5">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
        euismod, tellus a blandit tempor, velit turpis faucibus nibh, vitae
        feugiat purus dui sed arcu.
      </p>
      <p>
        Curabitur facilisis justo vitae arcu consectetur, sit amet posuere sem
        ultricies. Vestibulum ante ipsum primis in faucibus orci luctus et
        ultrices posuere cubilia curae; sed convallis risus ac orci gravida, at
        commodo neque dignissim.
      </p>
    </LegalPage>
  )
}
