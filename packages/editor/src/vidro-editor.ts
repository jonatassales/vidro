import {
  type EditorPresentation,
  normalized,
  normalizedFiles,
  optionalString,
  requiredBoolean,
  requiredLanguage,
  requiredString,
  type VidroDiffFile,
  type VidroLanguage,
  type VidroPreset,
} from './configuration.js'
import type { VidroChangeDetail, VidroTypingDetail } from './events.js'
import {
  localizationStatus,
  requiredUiLocale,
  type VidroLocalizationStatus,
  type VidroUiLocale,
} from './localization.js'
import { prepareMonacoLocale } from './monaco-localization.js'
import type { MountedEditor } from './runtime.js'
import { subscribeTheme } from './theme.js'

export type { VidroLanguage } from './configuration.js'

const CODE_FONT = 'Geist Mono, ui-monospace, SFMono-Regular, Menlo, monospace'
const UPGRADE_PROPERTIES = [
  'value',
  'language',
  'uiLocale',
  'debounceMs',
  'fontFamily',
  'fontSize',
  'lineHeight',
  'preset',
  'editable',
  'header',
  'headerTitle',
  'icon',
  'clipboard',
  'languageSelector',
  'originalValue',
  'files',
] as const

function boundedNumber(
  name: string,
  value: unknown,
  low: number,
  high: number,
  integer: boolean,
): asserts value is number {
  if (typeof value !== 'number') throw new TypeError(`${name} must be a number`)
  if (
    !Number.isFinite(value) ||
    value < low ||
    value > high ||
    (integer && !Number.isInteger(value))
  ) {
    throw new RangeError(`${name} is outside the supported range`)
  }
}

/** The public browser element. Monaco resources are owned per connection. */
export class VidroEditor extends HTMLElement {
  #value = ''
  #language: VidroLanguage = 'plaintext'
  #uiLocale: VidroUiLocale = 'en'
  #debounceMs = 500
  #fontFamily = CODE_FONT
  #fontSize = 14
  #lineHeight = 20
  #preset: VidroPreset = 'default'
  #editable = false
  #header = true
  #headerTitle: string | undefined
  #icon: string | undefined
  #clipboard = true
  #languageSelector = false
  #originalValue = ''
  #files: readonly VidroDiffFile[] = Object.freeze([])
  #presentationTimer: number | undefined
  #mounted: MountedEditor | undefined
  #attempt: Promise<void> | undefined
  #abort: (() => void) | undefined
  #generation = 0
  #container: HTMLDivElement | undefined
  #upgradeError: unknown
  #initializedOnce = false
  #sessionActive = false
  #lastEditingSignalAt = 0
  #idleTimer: number | undefined
  #timerRevision = 0
  #operationGeneration = 0
  #composing = false
  #editorSignalDepth = 0
  #pendingDisposal: Promise<void> | undefined
  #stopTheme: (() => void) | undefined

  constructor() {
    super()
    try {
      this.#recoverUpgradeProperties()
    } catch (error) {
      this.#upgradeError = error
    }
  }

  get value(): string {
    return this.#value
  }
  set value(next: string) {
    requiredString('value', next)
    const canonical = normalized(next)
    if (canonical === this.#value) return
    this.#cancelSession()
    this.#mounted?.replaceValue(canonical)
    this.#value = canonical
    if (this.#initializedOnce) this.#dispatchChange(canonical, 'external')
  }

  get language(): VidroLanguage {
    return this.#language
  }
  set language(next: VidroLanguage) {
    requiredLanguage(next)
    if (next === this.#language) return
    this.#language = next
    this.#mounted?.setLanguage(next)
  }

  /** Set before connecting. Monaco's locale is shared by all editors in a document. */
  get uiLocale(): VidroUiLocale {
    return this.#uiLocale
  }
  set uiLocale(next: VidroUiLocale) {
    requiredUiLocale(next)
    if (next === this.#uiLocale) return
    if (this.isConnected && this.#attempt !== undefined)
      throw new DOMException(
        'Set uiLocale before connecting the editor',
        'InvalidStateError',
      )
    this.#uiLocale = next
  }
  get localizationStatus(): VidroLocalizationStatus {
    return localizationStatus(this.#uiLocale)
  }

  get preset(): VidroPreset {
    return this.#preset
  }
  set preset(next: VidroPreset) {
    requiredString('preset', next)
    if (!['default', 'diff', 'diff-split', 'diff-list'].includes(next))
      throw new RangeError('Unsupported Vidro preset')
    if (next === this.#preset) return
    this.#preset = next
    if (next === 'diff-list') this.#cancelSession()
    this.#refreshPresentation()
  }

  get editable(): boolean {
    return this.#editable
  }
  set editable(next: boolean) {
    requiredBoolean('editable', next)
    if (next === this.#editable) return
    this.#editable = next
    this.#refreshPresentation()
  }

  get header(): boolean {
    return this.#header
  }
  set header(next: boolean) {
    requiredBoolean('header', next)
    if (next === this.#header) return
    this.#header = next
    this.#refreshPresentation()
  }

  get headerTitle(): string | undefined {
    return this.#headerTitle
  }
  set headerTitle(next: string | undefined) {
    optionalString('headerTitle', next)
    if (next === this.#headerTitle) return
    this.#headerTitle = next
    this.#refreshPresentation()
  }

  get icon(): string | undefined {
    return this.#icon
  }
  set icon(next: string | undefined) {
    optionalString('icon', next)
    if (next === this.#icon) return
    this.#icon = next
    this.#refreshPresentation()
  }

  get clipboard(): boolean {
    return this.#clipboard
  }
  set clipboard(next: boolean) {
    requiredBoolean('clipboard', next)
    if (next === this.#clipboard) return
    this.#clipboard = next
    this.#refreshPresentation()
  }

  get languageSelector(): boolean {
    return this.#languageSelector
  }
  set languageSelector(next: boolean) {
    requiredBoolean('languageSelector', next)
    if (next === this.#languageSelector) return
    this.#languageSelector = next
    this.#refreshPresentation()
  }

  get originalValue(): string {
    return this.#originalValue
  }
  set originalValue(next: string) {
    requiredString('originalValue', next)
    const canonical = normalized(next)
    if (canonical === this.#originalValue) return
    this.#originalValue = canonical
    this.#refreshPresentation()
  }

  get files(): readonly VidroDiffFile[] {
    return this.#files
  }
  set files(next: readonly VidroDiffFile[]) {
    const files = normalizedFiles(next)
    this.#files = files
    this.#refreshPresentation()
  }

  get #presentation(): EditorPresentation {
    return {
      preset: this.#preset,
      editable: this.#editable,
      header: this.#header,
      headerTitle: this.#headerTitle,
      icon: this.#icon,
      clipboard: this.#clipboard,
      languageSelector: this.#languageSelector,
      originalValue: this.#originalValue,
      files: this.#files,
    }
  }

  #refreshPresentation(): void {
    const mounted = this.#mounted
    if (!mounted) return
    // A public event can request a different widget during Monaco's edit command.
    // Retain the new configuration immediately, then let that command unwind.
    if (this.#editorSignalDepth > 0) {
      if (this.#presentationTimer !== undefined) return
      this.#presentationTimer = window.setTimeout(() => {
        this.#presentationTimer = undefined
        if (mounted === this.#mounted)
          mounted.setPresentation(this.#presentation)
      }, 0)
      return
    }
    mounted.setPresentation(this.#presentation)
  }

  get debounceMs(): number {
    return this.#debounceMs
  }
  set debounceMs(next: number) {
    boundedNumber('debounceMs', next, 0, 2_147_483_647, true)
    this.#debounceMs = next
    if (this.#sessionActive) this.#scheduleLeave()
  }

  get fontFamily(): string {
    return this.#fontFamily
  }
  set fontFamily(next: string) {
    requiredString('fontFamily', next)
    if (next.trim() === '') throw new RangeError('fontFamily must not be empty')
    this.#fontFamily = next
    this.#mounted?.setTypography(this.#typography)
  }

  get fontSize(): number {
    return this.#fontSize
  }
  set fontSize(next: number) {
    boundedNumber('fontSize', next, 6, 100, false)
    this.#fontSize = next
    this.#mounted?.setTypography(this.#typography)
  }

  get lineHeight(): number {
    return this.#lineHeight
  }
  set lineHeight(next: number) {
    boundedNumber('lineHeight', next, 8, 150, true)
    this.#lineHeight = next
    this.#mounted?.setTypography(this.#typography)
  }

  get #typography(): Readonly<{
    fontFamily: string
    fontSize: number
    lineHeight: number
  }> {
    return {
      fontFamily: this.#fontFamily,
      fontSize: this.#fontSize,
      lineHeight: this.#lineHeight,
    }
  }

  connectedCallback(): void {
    if (this.#attempt) return
    this.#stopTheme = subscribeTheme(({ requested }) => {
      this.setAttribute('data-vidro-internal-theme', requested)
    })
    const generation = ++this.#generation
    let resolveAttempt!: () => void
    let rejectAttempt!: (reason: unknown) => void
    this.#attempt = new Promise<void>((resolve, reject) => {
      resolveAttempt = resolve
      rejectAttempt = reject
    })
    // A connection can be removed before any consumer asks for readiness.
    // Keep the rejected promise observable without creating a global unhandled rejection.
    void this.#attempt.catch(() => {})
    this.#abort = () =>
      rejectAttempt(
        new DOMException('Vidro connection was removed', 'AbortError'),
      )

    if (this.#upgradeError !== undefined) {
      const error = this.#upgradeError
      this.#upgradeError = undefined
      rejectAttempt(
        new Error('Vidro editor initialization failed', { cause: error }),
      )
      return
    }

    const container = document.createElement('div')
    container.className = 'vidro-editor__surface'
    this.#container = container
    this.append(container)

    void this.#initialize(generation, container, resolveAttempt, rejectAttempt)
  }

  disconnectedCallback(): void {
    if (this.#presentationTimer !== undefined)
      window.clearTimeout(this.#presentationTimer)
    this.#presentationTimer = undefined
    this.#stopTheme?.()
    this.#stopTheme = undefined
    ++this.#generation
    this.#cancelSession()
    this.#abort?.()
    this.#abort = undefined
    this.#attempt = undefined
    const mounted = this.#mounted
    this.#mounted = undefined
    if (mounted) {
      // An edit command can continue using its model after a public callback.
      // A reconnect waits for this command to unwind before creating a new model.
      if (this.#editorSignalDepth > 0) {
        const pending = new Promise<void>((resolve, reject) => {
          window.setTimeout(() => {
            try {
              mounted.dispose()
              resolve()
            } catch (error) {
              reject(error)
            }
          }, 0)
        })
        this.#pendingDisposal = pending
        void pending.catch(() => {})
      } else mounted.dispose()
    }
    this.#container?.remove()
    this.#container = undefined
  }

  whenReady(): Promise<void> {
    return (
      this.#attempt ??
      Promise.reject(
        new DOMException('Vidro editor is detached', 'InvalidStateError'),
      )
    )
  }

  async #initialize(
    generation: number,
    container: HTMLDivElement,
    resolveAttempt: () => void,
    rejectAttempt: (reason: unknown) => void,
  ): Promise<void> {
    try {
      await prepareMonacoLocale(this.#uiLocale)
      if (generation !== this.#generation || !this.isConnected) return
      const { mountEditor, prepareRuntime } = await import('./runtime.js')
      if (generation !== this.#generation || !this.isConnected) return
      await prepareRuntime()
      if (generation !== this.#generation || !this.isConnected) return
      const pendingDisposal = this.#pendingDisposal
      if (pendingDisposal) {
        try {
          await pendingDisposal
        } finally {
          if (this.#pendingDisposal === pendingDisposal)
            this.#pendingDisposal = undefined
        }
      }
      if (generation !== this.#generation || !this.isConnected) return
      const mounted = mountEditor(container, {
        uiLocale: this.#uiLocale,
        value: this.#value,
        language: this.#language,
        typography: this.#typography,
        presentation: this.#presentation,
        onLanguage: (language) => {
          this.language = language
        },
        onFileLanguage: (id, language) => {
          this.files = this.#files.map((file) =>
            file.id === id ? { ...file, language } : file,
          )
        },
        onValue: (value) => this.#acceptUserValue(value, generation),
        onCompositionStart: () => this.#acceptCompositionStart(generation),
        onCompositionEnd: () => this.#acceptCompositionEnd(generation),
      })
      if (generation !== this.#generation || !this.isConnected) {
        mounted.dispose()
        return
      }
      this.#mounted = mounted
      this.#initializedOnce = true
      resolveAttempt()
    } catch (error) {
      if (generation !== this.#generation) return
      this.#mounted?.dispose()
      this.#mounted = undefined
      this.#container?.remove()
      this.#container = undefined
      rejectAttempt(
        new Error('Vidro editor initialization failed', { cause: error }),
      )
    }
  }

  #recoverUpgradeProperties(): void {
    const properties = this as unknown as Record<string, unknown>
    let firstError: unknown
    for (const key of UPGRADE_PROPERTIES) {
      if (!Object.hasOwn(this, key)) continue
      const value = properties[key]
      delete properties[key]
      try {
        properties[key] = value
      } catch (error) {
        firstError ??= error
      }
    }
    if (firstError !== undefined) throw firstError
  }

  #acceptUserValue(value: string, generation: number): void {
    if (generation !== this.#generation || !this.isConnected) return
    ++this.#editorSignalDepth
    try {
      const canonical = normalized(value)
      if (canonical === this.#value) return
      const signalAt = performance.now()
      const operation = ++this.#operationGeneration
      const startsSession = !this.#sessionActive
      this.#sessionActive = true
      this.#lastEditingSignalAt = signalAt
      this.#clearIdleTimer()
      this.#value = canonical
      if (this.#initializedOnce && this.#mounted) {
        if (startsSession) {
          this.#dispatchTyping('vidro-type-start', canonical)
          if (operation !== this.#operationGeneration || !this.isConnected)
            return
        }
        this.#dispatchChange(canonical, 'user')
        if (operation !== this.#operationGeneration || !this.isConnected) return
        this.#scheduleLeave()
      }
    } finally {
      --this.#editorSignalDepth
    }
  }

  #cancelSession(): void {
    ++this.#operationGeneration
    this.#sessionActive = false
    this.#composing = false
    this.#clearIdleTimer()
  }

  #acceptCompositionStart(generation: number): void {
    if (generation !== this.#generation || !this.isConnected) return
    this.#composing = true
    this.#clearIdleTimer()
  }

  #acceptCompositionEnd(generation: number): void {
    if (
      generation !== this.#generation ||
      !this.isConnected ||
      !this.#composing
    )
      return
    this.#composing = false
    if (!this.#sessionActive) return
    this.#lastEditingSignalAt = performance.now()
    this.#scheduleLeave()
  }

  #clearIdleTimer(): void {
    ++this.#timerRevision
    if (this.#idleTimer !== undefined) window.clearTimeout(this.#idleTimer)
    this.#idleTimer = undefined
  }

  #scheduleLeave(): void {
    this.#clearIdleTimer()
    if (!this.#sessionActive || !this.isConnected || this.#composing) return
    const revision = this.#timerRevision
    const deadline = this.#lastEditingSignalAt + this.#debounceMs
    this.#idleTimer = window.setTimeout(
      () => {
        if (revision !== this.#timerRevision || !this.#sessionActive) return
        if (performance.now() < deadline) {
          this.#scheduleLeave()
          return
        }
        const value = this.#value
        this.#sessionActive = false
        this.#clearIdleTimer()
        this.#dispatchTyping('vidro-type-leave', value)
      },
      Math.max(0, deadline - performance.now()),
    )
  }

  #dispatchTyping(
    name: 'vidro-type-start' | 'vidro-type-leave',
    value: string,
  ): void {
    this.dispatchEvent(
      new CustomEvent<VidroTypingDetail>(name, {
        detail: Object.freeze({ value, origin: 'user' }),
        bubbles: true,
        composed: true,
        cancelable: false,
      }),
    )
  }

  #dispatchChange(value: string, origin: VidroChangeDetail['origin']): void {
    this.dispatchEvent(
      new CustomEvent<VidroChangeDetail>('vidro-change', {
        detail: Object.freeze({ value, origin }),
        bubbles: true,
        composed: true,
        cancelable: false,
      }),
    )
  }
}
