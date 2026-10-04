export const LANGUAGE_LABELS = {
  plaintext: 'Plain text',
  json: 'JSON',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  html: 'HTML',
  css: 'CSS',
  markdown: 'Markdown',
} as const

export type VidroLanguage = keyof typeof LANGUAGE_LABELS
export type VidroPreset = 'default' | 'diff' | 'diff-split' | 'diff-list'

export interface VidroDiffFile {
  readonly id: string
  readonly originalValue: string
  readonly value: string
  readonly headerTitle?: string
  readonly icon?: string
  readonly language?: VidroLanguage
}

export interface Typography {
  readonly fontFamily: string
  readonly fontSize: number
  readonly lineHeight: number
}

export interface EditorPresentation {
  readonly preset: VidroPreset
  readonly editable: boolean
  readonly header: boolean
  readonly headerTitle: string | undefined
  readonly icon: string | undefined
  readonly clipboard: boolean
  readonly languageSelector: boolean
  readonly originalValue: string
  readonly files: readonly VidroDiffFile[]
}

export function normalized(value: string): string {
  return value.replace(/\r\n?/g, '\n')
}

export function requiredString(
  name: string,
  value: unknown,
): asserts value is string {
  if (typeof value !== 'string') throw new TypeError(`${name} must be a string`)
}

export function optionalString(
  name: string,
  value: unknown,
): asserts value is string | undefined {
  if (value !== undefined) requiredString(name, value)
}

export function requiredBoolean(
  name: string,
  value: unknown,
): asserts value is boolean {
  if (typeof value !== 'boolean')
    throw new TypeError(`${name} must be a boolean`)
}

export function requiredLanguage(
  value: unknown,
): asserts value is VidroLanguage {
  requiredString('language', value)
  if (!Object.hasOwn(LANGUAGE_LABELS, value))
    throw new RangeError('Unsupported Vidro language')
}

/** Copy the entire input only after validating it; callers cannot mutate retained files. */
export function normalizedFiles(value: unknown): readonly VidroDiffFile[] {
  if (!Array.isArray(value)) throw new TypeError('files must be an array')
  const ids = new Set<string>()
  const files: VidroDiffFile[] = []
  for (const entry of value) {
    if (entry === null || typeof entry !== 'object' || Array.isArray(entry))
      throw new TypeError('Each file must be an object')
    const {
      id,
      originalValue,
      value: modified,
      headerTitle,
      icon,
      language,
    } = entry
    requiredString('file.id', id)
    if (!id.trim() || ids.has(id))
      throw new RangeError('File IDs must be nonempty and unique')
    ids.add(id)
    requiredString('file.originalValue', originalValue)
    requiredString('file.value', modified)
    optionalString('file.headerTitle', headerTitle)
    optionalString('file.icon', icon)
    if (language !== undefined) requiredLanguage(language)
    files.push(
      Object.freeze({
        id,
        originalValue: normalized(originalValue),
        value: normalized(modified),
        headerTitle,
        icon,
        language,
      }),
    )
  }
  return Object.freeze(files)
}
