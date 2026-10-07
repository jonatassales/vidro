import * as monaco from 'monaco-editor/editor/editor.api.js'
import { formatUiNumber, UI_COPY, type VidroUiLocale } from './localization.js'
import 'monaco-editor/languages/definitions/javascript/register.js'
import 'monaco-editor/languages/definitions/typescript/register.js'
import 'monaco-editor/languages/definitions/html/register.js'
import 'monaco-editor/languages/definitions/css/register.js'
import 'monaco-editor/languages/definitions/markdown/register.js'
import {
  getWorker as getJsonWorker,
  jsonDefaults,
} from 'monaco-editor/languages/features/json/register.js'
// JSON support registers shared contributions; load them before creating editor services.
import 'monaco-editor/languages/features/json/jsonMode.js'
import editorWorkerUrl from './workers/editor.worker.ts?worker&url'
import jsonWorkerUrl from './workers/json.worker.ts?worker&url'
import './style.css'
import {
  chromeIcon,
  copyButton,
  copyStatus,
  copyText,
  createSummaryChrome,
  languageSelect,
} from './chrome.js'
import {
  type EditorPresentation,
  LANGUAGE_LABELS,
  type Typography,
  type VidroDiffFile,
  type VidroLanguage,
} from './configuration.js'
import { type DiffStats, diffStats } from './diff-stats.js'
import { type ContentFit, fitContent } from './fit-content.js'
import { subscribeTheme } from './theme.js'

export interface MountedEditor {
  replaceValue(value: string): void
  setLanguage(language: VidroLanguage): void
  setTypography(typography: Typography): void
  setPresentation(presentation: EditorPresentation): void
  dispose(): void
}

declare global {
  interface Window {
    MonacoEnvironment?: {
      getWorker(_: string, label: string): Worker
    }
  }
}

let workerConfigured = false
let runtimePreparation: Promise<void> | undefined
let nextFileContentId = 0

async function requireAsset(url: string): Promise<void> {
  const response = await fetch(url)
  if (!response.ok)
    throw new Error(`Vidro runtime asset failed: ${response.status}`)
  await response.arrayBuffer()
}

/** Share successful asset setup, but let a later connection retry a failed fetch. */
export function prepareRuntime(): Promise<void> {
  runtimePreparation ??= Promise.all([
    requireAsset(editorWorkerUrl),
    requireAsset(jsonWorkerUrl),
  ])
    .then(async () => {
      configureWorker()
      await import('monaco-editor/languages/features/json/jsonMode.js')
      // Activate JSON's asynchronous token provider without mounting an editor.
      const jsonSeed = monaco.editor.createModel('', 'json')
      try {
        await getJsonWorker()
      } finally {
        jsonSeed.dispose()
      }
      // Inline deleted lines need tokenizers ready before their first render.
      await Promise.all(
        Object.keys(LANGUAGE_LABELS).map((language) =>
          monaco.editor.colorize('', language, {}),
        ),
      )
    })
    .catch((error: unknown) => {
      runtimePreparation = undefined
      throw error
    })
  return runtimePreparation
}

function configureWorker(): void {
  if (workerConfigured) return
  jsonDefaults.setDiagnosticsOptions({ validate: false })
  jsonDefaults.setModeConfiguration({
    documentFormattingEdits: false,
    documentRangeFormattingEdits: false,
    completionItems: false,
    hovers: false,
    documentSymbols: false,
    tokens: true,
    colors: false,
    foldingRanges: false,
    diagnostics: false,
    selectionRanges: false,
  })
  window.MonacoEnvironment = {
    getWorker(_moduleId, label) {
      if (label === 'json') {
        return new Worker(jsonWorkerUrl, { type: 'module' })
      }
      return new Worker(editorWorkerUrl, { type: 'module' })
    },
  }
  monaco.editor.defineTheme('vidro-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '737373' },
      { token: 'keyword', foreground: 'D1005C' },
      { token: 'string', foreground: '008A2F' },
      { token: 'number', foreground: '7928CA' },
      { token: 'type', foreground: '7928CA' },
      { token: 'tag', foreground: 'D1005C' },
      { token: 'attribute.name', foreground: '006BDB' },
      { token: 'attribute.value', foreground: '008A2F' },
      { token: 'string.key.json', foreground: '171717' },
      { token: 'string.value.json', foreground: '0761D1' },
      { token: 'number.json', foreground: '7928CA' },
      { token: 'keyword.json', foreground: '7928CA' },
      { token: 'delimiter.bracket.json', foreground: '4D4D4D' },
      { token: 'delimiter.array.json', foreground: '4D4D4D' },
      { token: 'delimiter.colon.json', foreground: '4D4D4D' },
      { token: 'delimiter.comma.json', foreground: '4D4D4D' },
    ],
    colors: {
      'editor.background': '#FFFFFF00',
      'editorGutter.background': '#FFFFFF00',
      'editor.foreground': '#171717',
      'editor.selectionBackground': '#D3E5FF',
      'editor.lineHighlightBackground': '#FAFAFA',
      'editorLineNumber.foreground': '#737373',
      'editorLineNumber.activeForeground': '#525252',
      'diffEditor.insertedLineBackground': '#E6F8EC',
      'diffEditor.insertedTextBackground': '#ACE7C366',
      'diffEditor.removedLineBackground': '#FFF0F0',
      'diffEditor.removedTextBackground': '#FFC2C266',
      'diffEditorGutter.insertedLineBackground': '#C6F0D5',
      'diffEditorGutter.removedLineBackground': '#FFDBDB',
      'editorBracketHighlight.foreground1': '#4D4D4D',
      'editorBracketHighlight.foreground2': '#4D4D4D',
      'editorBracketHighlight.foreground3': '#4D4D4D',
      'editorBracketHighlight.foreground4': '#4D4D4D',
      'editorBracketHighlight.foreground5': '#4D4D4D',
      'editorBracketHighlight.foreground6': '#4D4D4D',
    },
  })
  monaco.editor.defineTheme('vidro-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '999999' },
      { token: 'keyword', foreground: 'FF5C9B' },
      { token: 'string', foreground: '50E386' },
      { token: 'number', foreground: 'C5A3FF' },
      { token: 'type', foreground: 'C58AF9' },
      { token: 'tag', foreground: 'FF5C9B' },
      { token: 'attribute.name', foreground: '8AB4FF' },
      { token: 'attribute.value', foreground: '50E386' },
      { token: 'string.key.json', foreground: 'EDEDED' },
      { token: 'string.value.json', foreground: '8AB4FF' },
      { token: 'number.json', foreground: 'C5A3FF' },
      { token: 'keyword.json', foreground: 'C5A3FF' },
      { token: 'delimiter.bracket.json', foreground: 'B0B0B0' },
      { token: 'delimiter.array.json', foreground: 'B0B0B0' },
      { token: 'delimiter.colon.json', foreground: 'B0B0B0' },
      { token: 'delimiter.comma.json', foreground: 'B0B0B0' },
    ],
    colors: {
      'editor.background': '#17171700',
      'editorGutter.background': '#17171700',
      'editor.foreground': '#EDEDED',
      'editor.selectionBackground': '#244063',
      'editor.lineHighlightBackground': '#202020',
      'editorLineNumber.foreground': '#999999',
      'editorLineNumber.activeForeground': '#B0B0B0',
      'diffEditor.insertedLineBackground': '#193326',
      'diffEditor.insertedTextBackground': '#2D6B4266',
      'diffEditor.removedLineBackground': '#3A2025',
      'diffEditor.removedTextBackground': '#8A3E4866',
      'diffEditorGutter.insertedLineBackground': '#244B34',
      'diffEditorGutter.removedLineBackground': '#5B2D35',
      'editorBracketHighlight.foreground1': '#B0B0B0',
      'editorBracketHighlight.foreground2': '#B0B0B0',
      'editorBracketHighlight.foreground3': '#B0B0B0',
      'editorBracketHighlight.foreground4': '#B0B0B0',
      'editorBracketHighlight.foreground5': '#B0B0B0',
      'editorBracketHighlight.foreground6': '#B0B0B0',
    },
  })
  subscribeTheme(({ effective }) => {
    monaco.editor.setTheme(
      effective === 'light'
        ? 'vidro-light'
        : effective === 'dark'
          ? 'vidro-dark'
          : effective,
    )
  })
  workerConfigured = true
}

type MountOptions = Readonly<{
  uiLocale: VidroUiLocale
  value: string
  language: VidroLanguage
  typography: Typography
  presentation: EditorPresentation
  onValue(value: string): void
  onCompositionStart(): void
  onCompositionEnd(): void
  onLanguage(language: VidroLanguage): void
  onFileLanguage(id: string, language: VidroLanguage): void
}>

type DefaultView = {
  readonly kind: 'default'
  readonly editor: monaco.editor.IStandaloneCodeEditor
  readonly fit: ContentFit
  readonly isComposing: () => boolean
  dispose(): void
}

type DiffView = {
  readonly kind: 'diff'
  readonly editor: monaco.editor.IStandaloneDiffEditor
  readonly originalModel: monaco.editor.ITextModel
  readonly fit: ContentFit
  dispose(): void
}

type SingleView = DefaultView | DiffView

type ListView = {
  readonly editor: monaco.editor.IStandaloneDiffEditor
  readonly originalModel: monaco.editor.ITextModel
  readonly modifiedModel: monaco.editor.ITextModel
  readonly fit: ContentFit
  dispose(): void
}

type ListRow = {
  readonly element: HTMLDivElement
  update(file: VidroDiffFile): void
  updateTypography(): void
  dispose(): void
}

function editorSurface(): HTMLDivElement {
  const surface = document.createElement('div')
  surface.className = 'vidro-editor__code'
  return surface
}

function editorOptions(typography: Typography, locale: VidroUiLocale) {
  const messages = UI_COPY[locale]
  return {
    ariaLabel: messages.editorText,
    automaticLayout: true,
    fontFamily: typography.fontFamily,
    fontSize: typography.fontSize,
    lineHeight: typography.lineHeight,
    autoDetectHighContrast: false,
    bracketPairColorization: { enabled: false },
    colorDecorators: false,
    minimap: { enabled: false },
    lineNumbers: 'off',
    lineDecorationsWidth: 16,
    lineNumbersMinChars: 3,
    renderLineHighlight: 'none',
    overviewRulerLanes: 0,
    overviewRulerBorder: false,
    hideCursorInOverviewRuler: true,
    glyphMargin: false,
    folding: false,
    padding: { top: 14, bottom: 14 },
    scrollBeyondLastLine: false,
    scrollbar: { alwaysConsumeMouseWheel: false },
  } as const
}

/** Inline deleted-line HTML must be painted from already tokenized originals. */
function prepareOriginalTokens(model: monaco.editor.ITextModel): void {
  monaco.editor.colorizeModelLine(model, model.getLineCount())
}

function refreshDiffTokens(
  editor: monaco.editor.IStandaloneDiffEditor,
  language?: VidroLanguage,
): void {
  const models = editor.getModel()
  if (!models) return
  const state = editor.saveViewState()
  // Reattach the same models to refresh cached inline deleted-line HTML.
  editor.setModel(null)
  if (language !== undefined) {
    monaco.editor.setModelLanguage(models.original, language)
    monaco.editor.setModelLanguage(models.modified, language)
  }
  prepareOriginalTokens(models.original)
  editor.setModel(models)
  if (state) editor.restoreViewState(state)
}

function watchDiffTheme(
  editor: monaco.editor.IStandaloneDiffEditor,
): () => void {
  let previous: string | undefined
  return subscribeTheme(({ effective }) => {
    if (previous !== undefined && previous !== effective)
      refreshDiffTokens(editor)
    previous = effective
  })
}

function createListView(
  surface: HTMLElement,
  file: VidroDiffFile,
  language: VidroLanguage,
  typography: Typography,
  split: boolean,
  locale: VidroUiLocale,
): ListView {
  const originalModel = monaco.editor.createModel(file.originalValue, language)
  let modifiedModel: monaco.editor.ITextModel | undefined
  let editor: monaco.editor.IStandaloneDiffEditor | undefined
  let fit: ContentFit | undefined
  try {
    modifiedModel = monaco.editor.createModel(file.value, language)
    prepareOriginalTokens(originalModel)
    editor = monaco.editor.createDiffEditor(surface, {
      ...editorOptions(typography, locale),
      originalAriaLabel: UI_COPY[locale].originalText,
      modifiedAriaLabel: UI_COPY[locale].modifiedText,
      lineNumbers: 'on',
      readOnly: true,
      originalEditable: false,
      renderSideBySide: split,
      useInlineViewWhenSpaceIsLimited: false,
      ignoreTrimWhitespace: false,
      renderOverviewRuler: false,
    })
    editor.setModel({ original: originalModel, modified: modifiedModel })
    fit = fitContent(surface, [
      editor.getOriginalEditor(),
      editor.getModifiedEditor(),
    ])
    const activeEditor = editor
    const activeFit = fit
    const activeModifiedModel = modifiedModel
    const stopWatchingTheme = watchDiffTheme(activeEditor)
    return {
      editor: activeEditor,
      originalModel,
      modifiedModel: activeModifiedModel,
      fit: activeFit,
      dispose() {
        stopWatchingTheme()
        activeFit.dispose()
        activeEditor.dispose()
        originalModel.dispose()
        activeModifiedModel.dispose()
      },
    }
  } catch (error) {
    fit?.dispose()
    editor?.dispose()
    originalModel.dispose()
    modifiedModel?.dispose()
    throw error
  }
}

/** One connection owns the canonical model, its active widget, and optional list rows. */
export function mountEditor(
  container: HTMLElement,
  options: MountOptions,
): MountedEditor {
  configureWorker()
  const locale = options.uiLocale
  const messages = UI_COPY[locale]
  const model = monaco.editor.createModel(options.value, options.language)
  let presentation = options.presentation
  let language = options.language
  let typography = options.typography
  let replacing = false
  let compositionReplacement: string | undefined
  let singleView: SingleView | undefined
  let rows = new Map<string, ListRow>()
  const statsCache = new Map<
    string,
    {
      originalValue: string
      value: string
      stats: DiffStats
    }
  >()
  let disposed = false

  const chrome = createSummaryChrome(
    (next) => options.onLanguage(next),
    () => model.getValue(monaco.editor.EndOfLinePreference.LF, true),
    locale,
  )
  const body = document.createElement('div')
  body.className = 'vidro-editor__body'
  container.append(chrome.element, body)

  function closeSingleView(): void {
    const old = singleView
    singleView = undefined
    old?.dispose()
  }

  function closeRows(): void {
    const old = rows
    rows = new Map()
    for (const row of old.values()) row.dispose()
    statsCache.clear()
    body.replaceChildren()
  }

  function fileStats(file: VidroDiffFile): DiffStats {
    const cached = statsCache.get(file.id)
    if (
      cached?.originalValue === file.originalValue &&
      cached.value === file.value
    )
      return cached.stats
    const stats = diffStats(file.originalValue, file.value)
    statsCache.set(file.id, {
      originalValue: file.originalValue,
      value: file.value,
      stats,
    })
    return stats
  }

  function createDefaultView(): DefaultView {
    const surface = editorSurface()
    body.replaceChildren(surface)
    let editor: monaco.editor.IStandaloneCodeEditor | undefined
    let fit: ContentFit | undefined
    let compositionStart: monaco.IDisposable | undefined
    let compositionEnd: monaco.IDisposable | undefined
    let composing = false
    try {
      editor = monaco.editor.create(surface, {
        ...editorOptions(typography, locale),
        model,
        readOnly: !presentation.editable,
      })
      compositionStart = editor.onDidCompositionStart(() => {
        composing = true
        compositionReplacement = undefined
        options.onCompositionStart()
      })
      compositionEnd = editor.onDidCompositionEnd(() => {
        composing = false
        compositionReplacement = undefined
        options.onCompositionEnd()
      })
      fit = fitContent(surface, [editor])
      const activeEditor = editor
      const activeFit = fit
      const activeStart = compositionStart
      const activeEnd = compositionEnd
      return {
        kind: 'default',
        editor: activeEditor,
        fit: activeFit,
        isComposing: () => composing || activeEditor.inComposition,
        dispose() {
          if (composing || activeEditor.inComposition) {
            composing = false
            compositionReplacement = undefined
            options.onCompositionEnd()
          }
          activeStart.dispose()
          activeEnd.dispose()
          activeFit.dispose()
          activeEditor.dispose()
          surface.remove()
        },
      }
    } catch (error) {
      compositionStart?.dispose()
      compositionEnd?.dispose()
      fit?.dispose()
      editor?.dispose()
      surface.remove()
      throw error
    }
  }

  function createDiffView(split: boolean): DiffView {
    const surface = editorSurface()
    body.replaceChildren(surface)
    const originalModel = monaco.editor.createModel(
      presentation.originalValue,
      language,
    )
    let editor: monaco.editor.IStandaloneDiffEditor | undefined
    let fit: ContentFit | undefined
    try {
      prepareOriginalTokens(originalModel)
      editor = monaco.editor.createDiffEditor(surface, {
        ...editorOptions(typography, locale),
        originalAriaLabel: UI_COPY[locale].originalText,
        modifiedAriaLabel: UI_COPY[locale].modifiedText,
        lineNumbers: 'on',
        readOnly: true,
        originalEditable: false,
        renderSideBySide: split,
        useInlineViewWhenSpaceIsLimited: false,
        ignoreTrimWhitespace: false,
        renderOverviewRuler: false,
      })
      editor.setModel({ original: originalModel, modified: model })
      fit = fitContent(surface, [
        editor.getOriginalEditor(),
        editor.getModifiedEditor(),
      ])
      const activeEditor = editor
      const activeFit = fit
      const stopWatchingTheme = watchDiffTheme(activeEditor)
      return {
        kind: 'diff',
        editor: activeEditor,
        originalModel,
        fit: activeFit,
        dispose() {
          stopWatchingTheme()
          activeFit.dispose()
          activeEditor.dispose()
          originalModel.dispose()
          surface.remove()
        },
      }
    } catch (error) {
      fit?.dispose()
      editor?.dispose()
      originalModel.dispose()
      surface.remove()
      throw error
    }
  }

  function createRow(file: VidroDiffFile, initiallyExpanded: boolean): ListRow {
    let current = file
    let expanded = initiallyExpanded
    let split = false
    let view: ListView | undefined
    const element = document.createElement('div')
    element.className = 'vidro-editor__file-row'
    const card = document.createElement('div')
    card.className = 'vidro-editor__file'
    element.append(card)
    const heading = document.createElement('div')
    heading.className = 'vidro-editor__file-heading'
    const disclosure = document.createElement('button')
    disclosure.type = 'button'
    disclosure.className = 'vidro-editor__disclosure'
    const icon = chromeIcon(locale)
    const fileName = document.createElement('span')
    fileName.className = 'vidro-editor__file-name'
    const count = document.createElement('span')
    count.className = 'vidro-editor__file-count'
    const addedCount = document.createElement('span')
    addedCount.className = 'vidro-editor__added-count'
    const deletedCount = document.createElement('span')
    deletedCount.className = 'vidro-editor__deleted-count'
    count.append(addedCount, deletedCount)
    const actions = document.createElement('span')
    actions.className = 'vidro-editor__file-actions'
    const layout = document.createElement('button')
    layout.type = 'button'
    layout.className = 'vidro-editor__layout-button'
    const selector = languageSelect(
      messages.fileLanguage(file.id),
      (next) => {
        options.onFileLanguage(current.id, next)
      },
      locale,
    )
    const copy = copyButton(messages.copyFile(file.id))
    const status = copyStatus()
    const content = document.createElement('div')
    content.className = 'vidro-editor__file-content'
    content.id = `vidro-file-${++nextFileContentId}`
    disclosure.setAttribute('aria-controls', content.id)
    disclosure.addEventListener('click', () => {
      expanded = !expanded
      if (expanded) mountRowView()
      else closeRowView()
      syncDisclosure()
    })
    layout.addEventListener('click', () => {
      split = !split
      view?.editor.updateOptions({ renderSideBySide: split })
      view?.fit.refresh()
      syncLayout()
    })
    copy.addEventListener('click', () => {
      void copyText(current.value, status, locale)
    })
    actions.append(layout, selector, copy, status)
    heading.append(disclosure, icon.element, fileName, count, actions)
    card.append(heading, content)

    function syncDisclosure(): void {
      disclosure.textContent = expanded ? '▾' : '▸'
      disclosure.setAttribute('aria-expanded', String(expanded))
      disclosure.setAttribute(
        'aria-label',
        (expanded ? messages.collapse : messages.expand)(fileLabel(current)),
      )
      content.hidden = !expanded
    }

    function syncLayout(): void {
      layout.textContent = split ? messages.split : messages.inline
      layout.setAttribute(
        'aria-label',
        (split ? messages.showInline : messages.showSplit)(fileLabel(current)),
      )
    }

    function closeRowView(): void {
      view?.dispose()
      view = undefined
      content.replaceChildren()
    }

    function mountRowView(): void {
      const surface = editorSurface()
      surface.classList.add('vidro-editor__file-surface')
      content.append(surface)
      try {
        view = createListView(
          surface,
          current,
          current.language ?? language,
          typography,
          split,
          locale,
        )
      } catch (error) {
        surface.remove()
        throw error
      }
    }

    function update(file: VidroDiffFile): void {
      current = file
      const label = fileLabel(file)
      fileName.textContent = label
      icon.update(file.icon, label)
      icon.element.hidden = !presentation.header || file.icon === undefined
      const stats = fileStats(file)
      addedCount.textContent = `+${formatUiNumber(locale, stats.added)}`
      deletedCount.textContent = `−${formatUiNumber(locale, stats.deleted)}`
      count.setAttribute(
        'aria-label',
        messages.lines(stats.added, stats.deleted),
      )
      selector.hidden = !presentation.header || !presentation.languageSelector
      selector.value = file.language ?? language
      copy.hidden = !presentation.header || !presentation.clipboard
      status.textContent = ''
      syncDisclosure()
      syncLayout()
      if (!expanded) return
      if (!view) {
        mountRowView()
        return
      }
      if (
        view.originalModel.getValue(
          monaco.editor.EndOfLinePreference.LF,
          true,
        ) !== file.originalValue
      )
        view.originalModel.setValue(file.originalValue)
      if (
        view.modifiedModel.getValue(
          monaco.editor.EndOfLinePreference.LF,
          true,
        ) !== file.value
      )
        view.modifiedModel.setValue(file.value)
      const nextLanguage = file.language ?? language
      if (view.originalModel.getLanguageId() !== nextLanguage) {
        refreshDiffTokens(view.editor, nextLanguage)
      }
      view.fit.refresh()
    }

    return {
      element,
      update,
      updateTypography() {
        view?.editor.updateOptions(typography)
        view?.fit.refresh()
      },
      dispose() {
        closeRowView()
        element.remove()
      },
    }
  }

  function renderList(): DiffStats {
    const nextRows = new Map<string, ListRow>()
    const totals: { added: number; deleted: number } = {
      added: 0,
      deleted: 0,
    }
    for (const [index, file] of presentation.files.entries()) {
      const stats = fileStats(file)
      totals.added += stats.added
      totals.deleted += stats.deleted
      const existing = rows.get(file.id)
      const row = existing ?? createRow(file, rows.size === 0 && index === 0)
      nextRows.set(file.id, row)
      if (body.children[index] !== row.element)
        body.insertBefore(row.element, body.children[index] ?? null)
      row.update(file)
    }
    for (const [id, row] of rows) {
      if (!nextRows.has(id)) {
        row.dispose()
        statsCache.delete(id)
      }
    }
    rows = nextRows
    return totals
  }

  function render(): void {
    body.classList.toggle(
      'vidro-editor__body--list',
      presentation.preset === 'diff-list',
    )
    if (presentation.preset === 'diff-list') {
      closeSingleView()
      chrome.update(presentation, language, renderList())
      return
    }
    if (rows.size > 0) closeRows()
    const wantsDefault = presentation.preset === 'default'
    if (singleView && (singleView.kind === 'default') !== wantsDefault)
      closeSingleView()
    singleView ??= wantsDefault
      ? createDefaultView()
      : createDiffView(presentation.preset === 'diff-split')
    if (singleView.kind === 'default') {
      singleView.editor.updateOptions({ readOnly: !presentation.editable })
    } else {
      singleView.editor.updateOptions({
        renderSideBySide: presentation.preset === 'diff-split',
        useInlineViewWhenSpaceIsLimited: false,
      })
      if (
        singleView.originalModel.getValue(
          monaco.editor.EndOfLinePreference.LF,
          true,
        ) !== presentation.originalValue
      )
        singleView.originalModel.setValue(presentation.originalValue)
      singleView.fit.refresh()
    }
    chrome.update(presentation, language)
  }

  const subscription = model.onDidChangeContent(() => {
    if (replacing || disposed) return
    const value = model.getValue(monaco.editor.EndOfLinePreference.LF, true)
    if (compositionReplacement !== undefined) {
      if (value !== compositionReplacement) {
        replacing = true
        try {
          model.setValue(compositionReplacement)
        } finally {
          replacing = false
        }
      }
      return
    }
    options.onValue(value)
  })

  try {
    render()
  } catch (error) {
    closeSingleView()
    closeRows()
    subscription.dispose()
    model.dispose()
    container.replaceChildren()
    throw error
  }

  return {
    replaceValue(value) {
      if (singleView?.kind === 'default' && singleView.isComposing())
        compositionReplacement = value
      replacing = true
      try {
        model.setValue(value)
      } finally {
        replacing = false
      }
    },
    setLanguage(next) {
      language = next
      if (singleView?.kind === 'diff')
        refreshDiffTokens(singleView.editor, next)
      else monaco.editor.setModelLanguage(model, next)
      if (presentation.preset === 'diff-list') renderList()
      chrome.update(
        presentation,
        language,
        presentation.preset === 'diff-list' ? listTotals() : undefined,
      )
    },
    setTypography(next) {
      typography = next
      if (singleView) {
        singleView.editor.updateOptions(next)
        singleView.fit.refresh()
      }
      for (const row of rows.values()) row.updateTypography()
    },
    setPresentation(next) {
      presentation = next
      render()
    },
    dispose() {
      if (disposed) return
      disposed = true
      subscription.dispose()
      try {
        closeSingleView()
      } finally {
        try {
          closeRows()
        } finally {
          model.dispose()
          container.replaceChildren()
        }
      }
    },
  }

  function listTotals(): DiffStats {
    const totals = { added: 0, deleted: 0 }
    for (const file of presentation.files) {
      const stats = fileStats(file)
      totals.added += stats.added
      totals.deleted += stats.deleted
    }
    return totals
  }
}

function fileLabel(file: VidroDiffFile): string {
  return file.headerTitle?.trim() ? file.headerTitle : file.id
}
