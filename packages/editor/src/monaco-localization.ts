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
      case 'pt-BR':
      case 'vi': {
        const catalog =
          target === 'pt-BR'
            ? await import('../localization/pt-BR.json')
            : await import('../localization/vi.json')
        const globals = globalThis as typeof globalThis & {
          _VSCODE_NLS_MESSAGES?: readonly (string | null)[]
          _VSCODE_NLS_LANGUAGE?: string
        }
        globals._VSCODE_NLS_MESSAGES = catalog.default
        globals._VSCODE_NLS_LANGUAGE = target === 'pt-BR' ? 'pt-br' : 'vi'
        break
      }
      case 'zh':
      case 'ja': {
        if (target === 'zh') await import('monaco-editor/nls/lang/zh-cn.js')
        else await import('monaco-editor/nls/lang/ja.js')
        const [
          { default: ids },
          { default: supplement },
          { default: corrections },
        ] = await Promise.all([
          import('../localization/cjk-message-ids.json'),
          target === 'zh'
            ? import('../localization/zh-supplement.json')
            : import('../localization/ja-supplement.json'),
          target === 'zh'
            ? import('../localization/zh-corrections.json')
            : import('../localization/ja-corrections.json'),
        ])
        const globals = globalThis as typeof globalThis & {
          _VSCODE_NLS_MESSAGES?: readonly (string | null)[]
        }
        const messages = [...(globals._VSCODE_NLS_MESSAGES ?? [])]
        for (const [english, positions] of Object.entries(ids)) {
          const translated = supplement[english as keyof typeof supplement]
          for (const position of positions) messages[position] = translated
        }
        for (const [id, translated] of Object.entries(corrections))
          messages[Number(id)] = translated
        globals._VSCODE_NLS_MESSAGES = messages
        break
      }
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
