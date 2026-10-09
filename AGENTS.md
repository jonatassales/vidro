# Vidro repository instructions

Vidro is an embeddable code editor. The owner approved the product pivot and editor import on 2026-10-04. Read [.agents/context/09-editor-product.ctx.md](.agents/context/09-editor-product.ctx.md) for scope, website composition, pricing, and retained legacy work.

## Current boundaries

- Explicit owner decisions take precedence over existing code and historical compiler guidance.
- `packages/editor` owns the framework-independent `<vidro-editor>` package, published package identity `vidropro`, Stone semantics, native styling, workers, and browser fixtures.
- Stone keeps its own `vidro-*` event names and canonical overridable 500ms inactivity window, measured after receiving editor signals.
- Consumers configure the element through its public JavaScript properties, events, and `whenReady()`; themes use the shared runtime `setTheme()`.
- `apps/website` owns the branded page: hero, embedded playground, pricing, footer. It uses the built editor package and never imports its internal source or Monaco.
- `@vidro/design-system` owns website tokens; `@vidro/react` owns shared site UI. Use Tailwind for website components. The editor package retains its framework-independent CSS.
- Keep the website's light icy-glass identity, logo, IBM Plex typography, locale selector, and centralized `en`, `pt-BR`, `zh`, `ja` translations. The embedded editor playground independently supports light and dark themes.
- The editor is free and open source under MIT. Developer support is optional, with a suggested R$ 5 contribution. The support section and its navigation link appear only for `pt-BR` and `en` (the site identifier for English, with `en_US` metadata). Payment details must come from the owner.
- Keep keyboard access, visible focus, reduced-motion support, and editor forced-colors behavior.
- Preserve legacy compiler packages and docs as historical work. Their DSL/CLI rules are scoped in [.agents/context/legacy-compiler-instructions.ctx.md](.agents/context/legacy-compiler-instructions.ctx.md); they do not define the current website or editor product.
