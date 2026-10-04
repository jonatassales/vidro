import type {
  VidroChangeDetail,
  VidroDiffFile,
  VidroEventMap,
  VidroLanguage,
  VidroPreset,
  VidroTheme,
  VidroTypingDetail,
} from 'vidro'
import { setTheme } from 'vidro'

const theme: VidroTheme = 'dark'
setTheme(theme)
// @ts-expect-error Only the two requested public modes are accepted.
setTheme('high-contrast')

const editor = document.createElement('vidro-editor')
const preset: VidroPreset = 'diff-list'
const language: VidroLanguage = 'typescript'
const file: VidroDiffFile = {
  id: 'example.ts',
  originalValue: 'before',
  value: 'after',
  language,
}
editor.preset = preset
editor.files = [file]
editor.originalValue = 'before'
editor.editable = false
editor.header = true
editor.headerTitle = 'Example'
editor.icon = '/example.svg'
editor.clipboard = true
editor.languageSelector = true
editor.language = language
// @ts-expect-error There is no public languages array.
editor.languages = ['json']
// @ts-expect-error Diff file snapshots are readonly.
editor.files[0].value = 'changed'
// @ts-expect-error Unsupported preset.
editor.preset = 'sideways'
// @ts-expect-error Booleans are not coerced.
editor.editable = 'true'
// @ts-expect-error The language catalog is bounded.
editor.language = 'python'
editor.addEventListener('vidro-change', (event) => {
  const detail: VidroChangeDetail = event.detail
  const origin: 'user' | 'external' = detail.origin
  const typedEvent: VidroEventMap['vidro-change'] = event
  void origin
  void typedEvent

  // @ts-expect-error The public event detail is readonly.
  detail.value = 'changed'
  // @ts-expect-error The origin is a closed public vocabulary.
  detail.origin = 'monaco'
})

editor.addEventListener('vidro-type-start', (event) => {
  const detail: VidroTypingDetail = event.detail
  const origin: 'user' = detail.origin
  const typedEvent: VidroEventMap['vidro-type-start'] = event
  void origin
  void typedEvent

  // @ts-expect-error Typing payload values are readonly.
  detail.value = 'changed'
  // @ts-expect-error Typing events cannot claim external origin.
  detail.origin = 'external'
})

editor.addEventListener('vidro-type-leave', (event) => {
  const detail: VidroTypingDetail = event.detail
  const typedEvent: VidroEventMap['vidro-type-leave'] = event
  void detail
  void typedEvent
})
