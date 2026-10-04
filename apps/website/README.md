# Vidro website

The existing Next.js website now presents the editor. Page order is hero with a live, theme-switchable editor and a framework/library carousel, playground, pricing, footer. The carousel highlights the native `<vidro-editor>` Web Component and uses locally licensed Devicon marks. It represents frontend ecosystems, not separate wrapper packages. The Vidro logo, IBM Plex fonts, cracked-glass hero, shared visual tokens, and four marketing locales are retained.

From the repository root, run `pnpm sandbox` or `pnpm sandbox --preview`. The launcher builds `packages/editor` and shared UI before serving this app. The website build generates `/hero-editor/index.html` and `/playground/index.html` from the public editor package and `/editor-api.md` from its README; generated files are ignored by Git.

The same-origin hero and playground frames size themselves using validated messages, keeping a single page scroll. In development, the package watcher finishes before the frames rebundle; open frames then reload automatically. The hero editor has a light/dark control; playground controls remain independent so the website retains its light branding.

Set the optional HTTPS `NEXT_PUBLIC_VIDRO_CHECKOUT_URL` to connect the R$ 3 one-time purchase action. Without it the card links to the playground. A payment processor is not implemented here.

Pricing/footer adapt official SmoothUI sources; see [provenance and license](vendor/smoothui/README.md). Website styling uses shared Vidro tokens and Tailwind, not SmoothUI's separate token system.
