> Historical compiler-era context. The editor and website pivot is governed by [09-editor-product.ctx.md](09-editor-product.ctx.md). Retain this record for legacy packages only.

# Web surfaces

Stable decisions for the public website and documentation. Website language support is unrelated to the Vidro environment DSL.

## Website

- Next.js App Router, React, TypeScript, and Tailwind.
- One route, `/`. A single-page landing. Light theme only.
- Procedural cracked-glass background: a fractured sheet across the viewport, with several pale clusters and a quieter center so the hero stays readable. No raster or SVG background asset, and no black spiderweb.
- Header, left cluster: Vidro logo, then the language switcher. Right cluster: Docs, then GitHub stars.
- Hero, installation command, then a marquee of the currently supported ecosystems. The marquee reads the canonical support matrix. Logos are real vendored marks, monochrome at rest and in their canonical colors on interaction. Unsupported ecosystems never appear. No features, pricing, testimonials, or FAQ unless explicitly requested.
- Locales: `en`, `pt-BR`, `zh`, `ja`.
- Locale switching follows the same lightweight client-side architecture as the NeonGate homepage. Selection persists in localStorage. There are no locale-prefixed routes. The default locale is English.
- Selector labels: `EN`, `PT-BR`, `中文`, `あ`. The switcher sits immediately to the right of the Vidro logo.
- Multilingual website copy is centralized in a locale module rather than distributed through JSX.
- Install commands, package-manager labels, the product name, and GitHub URLs are not translated.

## Docs

- Nextra, `nextra-theme-docs`, App Router, and Tailwind.
- Light theme only. No cracked-glass background.
- Native Nextra sidebar, search, and table of contents.
- Locales `en`, `pt-BR`, `zh`, and `ja`, using Nextra's locale content routing and the same `@vidro/react` language switcher as the website. There is no second language selector.
- The Vidro logo returns to the public website. It does not stay on the docs root.
- Navigation between the website and the docs carries the selected locale in the URL, because the two surfaces can be different origins. Both still persist `vidro-home-locale` locally. English is the default. The website stays a single route. HTML `lang` follows the active locale.
- Product examples live in the docs, not in a root `examples/` directory.

## Shared design

- `@vidro/design-system` owns tokens.
- `@vidro/react` owns shared React components and effects.
- Root `DESIGN.md` is an Airtable structural reference, not Vidro's brand.
- SmoothUI is interaction inspiration, not a dependency architecture.
- The website and docs do not duplicate the design system.
