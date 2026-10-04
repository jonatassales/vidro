> Superseded for the current website by [the editor product pivot](../context/09-editor-product.ctx.md). Its compiler/docs-specific restrictions apply only to retained legacy surfaces.

# 006 — Web surfaces

Scope: `apps/website`, `apps/docs`, `packages/design-system`, `packages/react`.

- Style with Tailwind. Do not add page or component CSS modules.
- Global CSS stays limited to the Tailwind import, Nextra's theme stylesheet, and the shared design-system theme.
- Vidro is light theme only. Do not add dark mode, a theme switch, or dark-mode tokens.
- Shared tokens come from `@vidro/design-system`.
- React UI used by both the website and the docs belongs in `@vidro/react`.
- Do not add a generic third-party component system that competes with the Vidro design system.
- Interactive UI needs keyboard access, visible focus, and `prefers-reduced-motion` support.
- The cracked-glass background belongs only on the public website. Docs stay on a plain light surface.
- Do not add a root `examples/` directory. Product examples live in the docs.
- Docs must not describe unimplemented CLI functionality as available.
- Do not introduce a separate i18n framework for the single-page website unless the owner changes that architecture.
- Website translations stay in the centralized locale module.
- Changing the website locale updates `document.documentElement.lang`, and the preference persists locally.
- The website and the docs use the shared `LanguageSwitcher` and the locale set `en`, `pt-BR`, `zh`, `ja`.
- Website translations stay centralized. The website does not add locale routes.
- Docs use Nextra's locale content routing, not a separate translation runtime, and do not show a second language selector.
- HTML `lang` follows the active locale, and the explicit locale preference persists locally.
- The website support marquee follows the canonical support matrix. Unsupported ecosystems never appear.
- The docs brand navigates to the public website, not to the docs root.
