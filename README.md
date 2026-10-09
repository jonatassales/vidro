# Vidro

An embeddable code editor with a little glass.

The Vidro editor is free and open source under the [MIT License](packages/editor/LICENCE.md). The npm archive includes the editor sources and build inputs. Developer support is voluntary; no purchase is required to use the editor.

Vidro provides a framework-independent `<vidro-editor>` Web Component: ordinary code, unified differences, split comparisons, and file lists. It includes seven syntax modes, light/dark themes, semantic editing events, and a supported styling API.

## Workspace

- [`packages/editor`](packages/editor/README.md): the `vidropro` package, public browser tests, and playground source.
- [`apps/website`](apps/website/README.md): the branded Next.js page, embedded playground, optional developer support, and footer.
- `packages/design-system` and `packages/react`: shared website branding and UI.

## Develop

Use the repository's Node and pnpm versions, then run `pnpm install` and `pnpm sandbox`. The command builds and watches the editor and serves the website at http://127.0.0.1:3000.

Use `pnpm sandbox --preview --port 3001` for production verification. `pnpm build`, `pnpm typecheck`, `pnpm lint`, and `pnpm test` validate the active editor/website product. The editor's original standalone browser fixtures remain inside its package.

The website keeps its existing Vidro branding and four locales. Its playground exposes all four presets and the full public controls through built package exports. The support section and its navigation link appear only in Brazilian Portuguese (`pt-BR`) and English (`en`, with `en_US` metadata). Support is optional and suggests **R$ 5**; all editor features remain available without a contribution.

Vercel's existing `vidro-website` project continues using `apps/website`. No live deployment is implied by local builds.

## Product history

The environment compiler, CLI, and legacy documentation are retained in their existing directories for reference. They are outside the current website/editor build and no longer define the Vidro product. See [.agents/context/09-editor-product.ctx.md](.agents/context/09-editor-product.ctx.md).
