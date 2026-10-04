# Editor product pivot — 2026-10-04

The owner explicitly replaced Vidro's environment-management identity with the embeddable editor and requested copying `/Users/sky/code/vidro.pro` into the existing `jonatassales/vidro` monorepo at `packages/editor`. This supersedes the prior compiler identity, single-package-only rule from the imported editor, and website section restrictions.

Keep the existing website branding and `apps/website` deployment root. Page order: existing-style hero rewritten for the editor with a compact theme-switchable editor directly below its slogan and a Web Component framework/library carousel, all four controllable editor presets in a playground section, SmoothUI-based pricing, SmoothUI-based footer. The owner set the price to **R$ 3, one-time purchase**. No payment provider, checkout URL, publication, or deployment was authorized by this implementation request.

The embedded playground is the same built public-package consumer used by editor tests. It remains English (`lang=en`) and owns its controls and light/dark mode inside an automatically sized same-origin frame. The compact hero preview separately imports the same public package, follows the system theme initially, and exposes a local light/dark switch. This isolates Monaco's Light DOM and library CSS from website Tailwind while keeping one scrollable website page. Frame messages validate origin, source, type, and numeric size. Website marketing translations stay centralized and retain the existing four locales.

The package identity remains `vidro`; the private workspace root is `vidro-workspace` to avoid duplicate package names. Preserve all four presets, default read-only behavior, public property validation, Stone semantics, typography/frame overrides, 80% body backgrounds, 8px blur, header-only gradients, and opaque accessibility fallbacks.

Legacy `packages/language`, `packages/core`, `packages/cli`, and `apps/docs` remain preserved but are no longer advertised by the website or part of the active editor/website build. Root build/typecheck target the website dependency graph. Existing legacy commands remain runnable explicitly through package filters.

`pnpm sandbox` builds dependencies and the embedded assets, watches editor output, and serves the website. `pnpm sandbox --preview` verifies its production build. Vercel continues using the existing website project and root; checked-in build configuration builds workspace dependencies. Live project settings and deployments require a separate action.

SmoothUI registry sources: https://smoothui.dev/r/pricing-1.json and https://smoothui.dev/r/footer-2.json. Adaptations and MIT attribution are recorded in `apps/website/vendor/smoothui/`.
