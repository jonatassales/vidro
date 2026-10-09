import type { VidroUiLocale } from 'vidropro'

const editor = document.createElement('vidro-editor')
editor.uiLocale = (new URLSearchParams(location.search).get('locale') ??
  'en') as VidroUiLocale
editor.value = 'const value = 1'
editor.originalValue = 'const value = 0'
editor.language = 'typescript'
editor.languageSelector = true
editor.editable = true
editor.style.display = 'block'
editor.style.width = '720px'
editor.files = [
  { id: 'one.ts', originalValue: 'first\nold', value: 'first\nnew\nadded' },
]
document.body.append(editor)
await import('vidropro')
await editor.whenReady()
document.body.dataset.ready = 'true'
