# Vidro

Vidro is a preview editor Web Component. Importing its browser package registers `<vidro-editor>`; an editor starts when the element connects.

Vidro is proprietary commercial software. See the [interim proprietary notice](LICENCE.md) and separate [third-party notices](third-party/README.md). The notice is not a final commercial EULA and does not grant unresolved customer rights.

```ts
import { setTheme } from 'vidro'

const editor = document.createElement('vidro-editor')
editor.style.cssText = 'display:block;width:100%;max-height:360px'
editor.value = '{\n  "hello": "world"\n}'
editor.language = 'json'
editor.editable = true // default is read only
document.body.append(editor)
await editor.whenReady()

editor.addEventListener('vidro-change', ({ detail }) => {
  console.log(detail.value, detail.origin) // canonical text; "user" or "external"
})
editor.addEventListener('vidro-type-start', ({ detail }) => {
  console.log('editing began', detail.value)
})
editor.addEventListener('vidro-type-leave', ({ detail }) => {
  console.log('editing settled', detail.value)
})
editor.debounceMs = 500 // default; set another nonnegative integer to override
setTheme('dark') // one requested mode for every Vidro editor
```

Vidro fits its content; a host height or max-height constrains it with internal scrolling. It ships its Monaco styles and workers through the package build; consumers do not import Monaco or configure its workers. Text is represented with LF line endings. Configuration uses JavaScript properties, not HTML attributes. Light DOM is used in this preview.

`setTheme('light' | 'dark')` selects the shared native editor palette. Light is the default. All four presets use subtle glass backgrounds at 80% opacity with one 8px backdrop blur per editor. Code uses a flat fill: light `#FFFFFFCC`, dark `#171717CC`. Only headers use a subtle 135-degree gradient: light `#FFFFFFCC` to `#FAFAFACC`, dark `#262626CC` to `#1F1F1FCC`. Each gradient is a single fill without stacked translucency. Text, syntax colors, icons, borders, selections, and diff highlights keep their existing sharp appearance. The glass is most visible over a varied background. Forced colors uses opaque `Canvas` surfaces without gradients or blur and restores the requested mode afterward. Browsers without backdrop-filter support use opaque surfaces without blur, with flat light `#FAFAFA` or dark `#1F1F1F` headers.

A frame can be customized independently with `--vidro-frame-background`, `--vidro-frame-border-color`, `--vidro-frame-border-radius`, `--vidro-frame-shadow`, and `--vidro-focus-ring-color`; these variables do not alter syntax colors. The default frame backing is transparent so the separate header and code fills show the page behind them. An explicit `--vidro-frame-background` is used unchanged as the frame's backing layer, without multiplying its opacity; it naturally affects the visible composite beneath the glass. No additional appearance properties or internal selectors are required. Rendered owner acceptance remains a preview gate.

## Presets

| `preset` | Content | Editing |
| --- | --- | --- |
| `default` | `value` | Only with `editable = true` |
| `diff` | Unified `originalValue` / `value` comparison | Read only |
| `diff-split` | Side-by-side `originalValue` / `value` comparison | Read only |
| `diff-list` | `files` entries with independent comparisons | Read only |

`preset` defaults to `default`; `editable` defaults to `false`. Each `files` entry contains a unique `id`, `originalValue`, and `value`, with optional `headerTitle`, `icon`, and `language`. Files without a language use the element's language. The list supports expansion, inline/split comparison, line counts, and copying modified content.

The header defaults to visible (`header = true`), with optional `headerTitle` and `icon` URL/path. `clipboard` defaults to `true`, and `languageSelector` defaults to `false`. Native `HTMLElement.title` remains a tooltip. Supported syntax modes are `plaintext` (the default), `json`, `javascript`, `typescript`, `html`, `css`, and `markdown`; highlighting does not validate content. There is no `languages` array property.

Presentation, comparison inputs, and copy actions emit no editing events. Actual external `value` changes retain their external change notification. The default editable preset retains immediate changes, debounced editing sessions, composition handling, and lifecycle recovery. Sinapsi/Jotai graph integration is deferred to a later cycle.

## Sandbox

```sh
pnpm sandbox
pnpm sandbox --preview
```

The first command builds the public package and declarations, watches them, and serves the single workbench at **http://127.0.0.1:4173/**. `--preview` builds the package and the production workbench, then serves **http://127.0.0.1:4174/**. Stop either command with Ctrl+C. Optional `--host` and `--port` arguments configure the local server.

The page displays all four presets together. The shared panel controls header, title/icon, copy, language selection, editability, idle delay, typography, frame variables, and preview height. Expand each preview's source or file inputs to replace its content; expand Events to observe the three public notifications. Editing starts disabled and can be enabled only in the default preset. The theme icon changes the shared runtime and the surrounding page.

The sandbox imports built `vidro` exports in both modes, with no source alias or direct Monaco setup. Its icon is bundled locally and fonts use local fallbacks, so the page needs no font or image CDN.

## Local checks

```sh
pnpm install --frozen-lockfile
pnpm lint
pnpm build
pnpm typecheck
pnpm test
VIDRO_PREVIEW=1 pnpm test
```

Playwright uses a separate test server: **http://127.0.0.1:4183/** in development and **http://127.0.0.1:4184/** for `VIDRO_PREVIEW=1`. Existing smoke/upgrade/theme fixtures live under `tests/fixtures` and keep their historical test URLs; `/sandbox/` serves the actual workbench in both modes. The production test server builds its consumer pages automatically. Run `pnpm build` before tests to refresh the public package.
