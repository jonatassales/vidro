export type {
  VidroDiffFile,
  VidroLanguage,
  VidroPreset,
} from './configuration.js'
export type {
  VidroChangeDetail,
  VidroEventMap,
  VidroTypingDetail,
} from './events.js'
export type { VidroLocalizationStatus, VidroUiLocale } from './localization.js'
export type { VidroTheme } from './theme.js'
export { setTheme } from './theme.js'
export { VidroEditor } from './vidro-editor.js'

import { VidroEditor } from './vidro-editor.js'

if (!customElements.get('vidro-editor')) {
  customElements.define('vidro-editor', VidroEditor)
}

declare global {
  interface HTMLElementTagNameMap {
    'vidro-editor': VidroEditor
  }
}
