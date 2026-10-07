import { localizationStatus, type VidroUiLocale } from './localization.js'

let selected: ReturnType<typeof localizationStatus>['monacoLocale'] | undefined
let loading: Promise<void> | undefined

/** Monaco resolves some NLS strings at module evaluation. One locale per document. */
export function prepareMonacoLocale(locale: VidroUiLocale): Promise<void> {
  const target = localizationStatus(locale).monacoLocale
  if (selected !== undefined && selected !== target)
    return Promise.reject(
      new Error(
        'Monaco UI locale is fixed for this document; navigate to a new document to change uiLocale',
      ),
    )
  selected = target
  loading ??= (async () => {
    switch (target) {
      case 'zh':
        await import('monaco-editor/nls/lang/zh-cn.js')
        break
      case 'ja':
        await import('monaco-editor/nls/lang/ja.js')
        break
      case 'en': {
        const globals = globalThis as typeof globalThis & {
          _VSCODE_NLS_MESSAGES?: readonly string[]
          _VSCODE_NLS_LANGUAGE?: string
        }
        globals._VSCODE_NLS_MESSAGES = undefined
        globals._VSCODE_NLS_LANGUAGE = 'en'
      }
    }
  })().catch((error: unknown) => {
    selected = undefined
    loading = undefined
    throw error
  })
  return loading
}
