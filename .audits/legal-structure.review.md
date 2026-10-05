# Legal structure implementation — 2026-10-05

## Result and routes

Implemented the owner's supplied legal text on `codex/commercial-license`, based on `origin/main` at `72030e9`.

- `/policies/`: Legal & Policies index replaces the lorem-ipsum page. The supplied statuses and statutory-rights statement are preserved verbatim.
- `/license/`: readable rendering of `packages/editor/LICENCE.md`, explicitly identified as an interim proprietary notice rather than a final commercial EULA.
- `/terms/`: supplied Terms of Sale pending-publication text.
- `/privacy/`: supplied actual-data-flow Privacy pending-publication text.
- `/third-party/`: supplied notice-review structure. It does not claim to be a completed dependency audit.
- The misspelled former route is deleted. A direct request returns 404 without a compatibility redirect, following the owner's explicit instruction to erase it. The framework's general trailing-slash normalization of a bare path ends at the same 404; there is no redirect to `/license/`.

Footer License links, legal navigation, page metadata/canonical URLs, sitemap, structured data, and active READMEs use the corrected route. Footer Legal & Policies labels are translated in all four home locales; legal documents remain English. Every legal page links to the same five documents and marks its current page. The index and license are indexable; pending Terms, Privacy, and Third-Party pages are noindex/follow and excluded from the sitemap.

## Package consistency and remaining wording

The editor package previously contained an MIT license field and an MIT permission grant in `packages/editor/LICENCE.md`. Both have been replaced as explained to the owner before implementation.

- Current npm `license`: `SEE LICENSE IN LICENCE.md`.
- `packages/editor/LICENCE.md` exists and contains the supplied proprietary notice, with the earlier owner-provided Commercial software label and emphasis. Its substantive text matches the supplied License block exactly.
- There is no root LICENSE, LICENSE.md, or COPYING file, and no separate first-party permissive grant was found in the package-facing files or source headers inspected.
- The only remaining active first-party MIT/open-source wording referring to Vidro is `packages/editor/LICENCE.md:7`: “Vidro is **not open-source software** and is not licensed under the MIT License or any other open-source license.” The website renders this same statement from the file. There are no remaining affirmative claims that Vidro is MIT licensed or open source in the inspected website, editor source, package metadata, or active package-facing documentation.
- Existing SmoothUI, Devicon, LobeHub, Monaco, and other asset notices and attribution remain intact. Source comments identifying SmoothUI's MIT license refer to that third party, not Vidro.
- Monaco Editor 0.57.0's installed upstream LICENSE and ThirdPartyNotices.txt were copied byte-for-byte into `packages/editor/third-party/monaco/` and explicitly included in the npm archive. This preserves available upstream notices without claiming that all distributed dependencies and assets have been audited.

No release was published, and no earlier release or Git history was rewritten. This prospective change does not retroactively revoke rights validly granted for older distributed versions. Any eventual publication must preserve earlier releases and use an appropriate new release version.

## Checkout and unresolved decisions

The displayed $1 one-time price is retained across all home locales. The pricing action always opens the playground; setting the former checkout environment variable cannot activate a purchase link. Purchasable Offer structured data was removed while sales are pending.

The notice reserves rights; it is not a final EULA granting defined customer entitlements. The owner still needs to define and publish the applicable software-license rights and restrictions, Terms of Sale including delivery, Preview/version/update entitlements, refund/cancellation and statutory rights, and applicable privacy information grounded in actual data flows/providers. A complete review must distinguish customer-distributed code, bundled runtime dependencies, incorporated assets, and development-only dependencies. No per-seat/per-company, modification, redistribution, support, warranty, liability, governing-law, company/contact, or privacy facts were invented. These matters remain unresolved, and checkout has not been presented as production-ready.

## Verification and limits

- `pnpm lint`, `pnpm typecheck`, and `pnpm build` passed for the final code snapshot. Builds retain existing Monaco import/chunk-size and fallback metadataBase warnings.
- Installed Playwright Chromium checked all five routes at production port 4184 and development port 4185. Body text was compared to the owner's provided Markdown after removing presentation markup. Heading, canonical, legal navigation, current-page indication, indexing status, and mobile overflow checks passed.
- All four home locales have corrected footer links, no misspelled route anchors, a playground-only pricing action, and a corrected license URL without a purchasable Offer in JSON-LD. Sitemap and removed-route checks passed.
- Production completed without browser errors. Development legal pages completed without browser errors. Development home pages can still report an existing LanguageSwitcher `useId` hydration mismatch; the strict full-page development check exposed this and remains a limitation, rather than evidence of a clean development console. Production did not reproduce it.
- A reduced-motion CopyButton class mismatch found in development was corrected by using CSS `motion-reduce:transition-none`, keeping server/client markup identical and preserving reduced-motion behavior. No editor runtime or event semantics changed.
- Desktop and 390px-wide mobile screenshots of the index and license were captured and visually inspected. They retain the website typography, pale glass surfaces, aligned footer, and readable legal hierarchy.
- `pnpm --filter vidro pack --pack-destination /tmp/vidro-commercial-license-pack` passed. The archive's license field and the exact proprietary and Monaco notice bytes were verified. Existing website third-party license files are unchanged.
- No production deployment, paid purchase, package publication, or full third-party legal audit was performed. The editor runtime test suite was not rerun for these legal/content changes.

## Files changed

- `.agents/context/09-editor-product.ctx.md`
- `.audits/legal-structure.review.md`
- `README.md`
- `apps/website/README.md`
- `apps/website/app/(legal)/legal-content.tsx`
- `apps/website/app/(legal)/legal-documents.ts`
- `apps/website/app/(legal)/legal-page.tsx`
- `apps/website/app/(legal)/license/page.tsx`
- `apps/website/app/(legal)/lisense/page.tsx`
- `apps/website/app/(legal)/policies/page.tsx`
- `apps/website/app/(legal)/privacy/page.tsx`
- `apps/website/app/(legal)/terms/page.tsx`
- `apps/website/app/(legal)/third-party/page.tsx`
- `apps/website/app/footer.tsx`
- `apps/website/app/home-locale.ts`
- `apps/website/app/metadata/page-metadata.ts`
- `apps/website/app/metadata/pages.json`
- `apps/website/app/metadata/structured-data.tsx`
- `apps/website/app/pricing.tsx`
- `apps/website/app/sitemap.ts`
- `packages/editor/LICENCE.md`
- `packages/editor/README.md`
- `packages/editor/package.json`
- `packages/editor/third-party/README.md`
- `packages/editor/third-party/monaco/LICENSE`
- `packages/editor/third-party/monaco/ThirdPartyNotices.txt`
- `packages/react/src/copy-button.tsx`
