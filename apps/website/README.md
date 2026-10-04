# Vidro website

The existing Next.js website now presents the editor. Page order is hero with a live editor that follows the system theme and a framework/library carousel, playground, pricing, footer. The centered header badges highlight the native `<vidro-editor>` Web Component; the carousel uses locally licensed Devicon marks to represent frontend ecosystems, not separate wrapper packages. The Vidro logo, IBM Plex fonts, cracked-glass hero, shared visual tokens, and four marketing locales are retained.

The locale pill expands on hover or click. Language links navigate to `/en/`, `/pt-BR/`, `/zh/`, and `/ja/`, preserving query strings and section hashes. Next.js Proxy redirects `/` to the preferred locale from the cookie or `Accept-Language` header, and visiting a locale route updates the cookie. The route renders the corresponding translation and HTML `lang` on the server.

The footer keeps the Vidro description aligned at the left, links to `/lisense/` and `/policies/`, and presents five icon links under “Backed by:”. Neongate's native `<orb-z>` Web Component appears beside its copyright in the bottom row. The social links use local hash targets until real destinations are provided. See [footer icon sources](public/backed-by/SOURCES.md).

`/lisense/` displays the editor package's MIT license. `/policies/` is a clearly marked, non-indexed lorem-ipsum placeholder until the owner provides policy text.

From the repository root, run `pnpm sandbox` or `pnpm sandbox --preview`. The launcher builds `packages/editor` and shared UI before serving this app. The website build generates `/hero-editor/index.html` and `/playground/index.html` from the public editor package and `/editor-api.md` from its README; generated files are ignored by Git.

The same-origin hero and playground frames size themselves using validated messages, keeping a single page scroll. In development, the package watcher finishes before the frames rebundle; open frames then reload automatically. The hero follows the operating system's light/dark preference without a visible switch; playground controls remain independent so the website retains its light branding.

Set the optional HTTPS `NEXT_PUBLIC_VIDRO_CHECKOUT_URL` to connect the $1 one-time purchase action. The same dollar price appears in all four locales. Without a checkout URL, the card links to the playground. A payment processor is not implemented here.

Pricing/footer adapt official SmoothUI sources; see [provenance and license](vendor/smoothui/README.md). Website styling uses shared Vidro tokens and Tailwind, not SmoothUI's separate token system.
