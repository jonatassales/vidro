import { localizationStatus, type VidroUiLocale } from './localization.js'

let selected: ReturnType<typeof localizationStatus>['monacoLocale'] | undefined
let loading: Promise<void> | undefined

/**
 * Official Monaco catalogs, completed by reviewed supplements for the shared
 * missing/untranslated IDs and by per-ID code-token corrections.
 */
const OFFICIAL_CATALOGS = {
  es: {
    catalog: () => import('monaco-editor/nls/lang/es.js'),
    supplement: () => import('../localization/es-supplement.json'),
    corrections: () => import('../localization/es-corrections.json'),
  },
  zh: {
    catalog: () => import('monaco-editor/nls/lang/zh-cn.js'),
    supplement: () => import('../localization/zh-supplement.json'),
    corrections: () => import('../localization/zh-corrections.json'),
  },
  ja: {
    catalog: () => import('monaco-editor/nls/lang/ja.js'),
    supplement: () => import('../localization/ja-supplement.json'),
    corrections: () => import('../localization/ja-corrections.json'),
  },
} as const

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
      case 'es':
      case 'zh':
      case 'ja': {
        const official = OFFICIAL_CATALOGS[target]
        await official.catalog()
        const [
          { default: ids },
          { default: supplement },
          { default: corrections },
        ] = await Promise.all([
          import('../localization/cjk-message-ids.json'),
          official.supplement(),
          official.corrections(),
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
