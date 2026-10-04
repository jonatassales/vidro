import type {
  VidroDiffFile,
  VidroLanguage,
  VidroPreset,
  VidroTheme,
} from 'vidro'
import { setTheme } from 'vidro'
import fileIcon from './assets/file.svg'
import './style.css'

type Editor = HTMLElementTagNameMap['vidro-editor']
const languages: readonly VidroLanguage[] = [
  'plaintext',
  'json',
  'javascript',
  'typescript',
  'html',
  'css',
  'markdown',
]
const languageNames: Record<VidroLanguage, string> = {
  plaintext: 'Plain text',
  json: 'JSON',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  html: 'HTML',
  css: 'CSS',
  markdown: 'Markdown',
}
const original = [
  'export function greet(name: string) {',
  '  return "Hello, " + name + "."',
  '}',
  '',
  'greet("world")',
].join('\n')
const modified = [
  'type Person = { name: string }',
  '',
  'export function greet(person: Person) {',
  '  return "Welcome, " + person.name + "."',
  '}',
  '',
  'greet({ name: "world" })',
].join('\n')
const initialFiles: readonly VidroDiffFile[] = [
  {
    id: 'src/greeting.ts',
    headerTitle: 'src/greeting.ts',
    originalValue: original,
    value: modified,
  },
  {
    id: 'styles.css',
    language: 'css',
    originalValue: '.card {\n  border-radius: 6px;\n}',
    value: '.card {\n  border-radius: 12px;\n  border: 1px solid #ebebeb;\n}',
  },
  {
    id: 'README.md',
    language: 'markdown',
    originalValue: '# Hello\n\nA small greeting.',
    value: '# Welcome\n\nA personal greeting for everyone.',
  },
]
const presets: readonly {
  preset: VidroPreset
  title: string
  description: string
  headerTitle: string
}[] = [
  {
    preset: 'default',
    title: 'Default',
    description:
      'A clean code surface. Enable editing to try the event lifecycle.',
    headerTitle: 'greeting.ts',
  },
  {
    preset: 'diff',
    title: 'Unified diff',
    description: 'Original and modified lines in one continuous view.',
    headerTitle: 'greeting.ts',
  },
  {
    preset: 'diff-split',
    title: 'Split diff',
    description: 'Compare the original and modified code side by side.',
    headerTitle: 'greeting.ts',
  },
  {
    preset: 'diff-list',
    title: 'File diff list',
    description: 'Explore changes by file. Expand, compare, and copy.',
    headerTitle: 'Changes',
  },
]

function query<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector)
  if (!element) throw new Error(`Missing sandbox element: ${selector}`)
  return element
}

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className = '',
  text = '',
) {
  const node = document.createElement(tag)
  node.className = className
  if (text) node.textContent = text
  return node
}

function button(text: string, action: () => void, className = 'small-button') {
  const node = element('button', className, text)
  node.type = 'button'
  node.addEventListener('click', action)
  return node
}

let fieldId = 0
function field(label: string, input: HTMLElement) {
  const node = element('div', 'field')
  if (!input.id) input.id = `sandbox-field-${++fieldId}`
  const caption = element('label', '', label)
  caption.htmlFor = input.id
  node.append(caption, input)
  return node
}

function textInput(value = '') {
  const input = element('input')
  input.type = 'text'
  input.value = value
  return input
}

function textArea(value: string) {
  const input = element('textarea')
  input.value = value
  input.spellcheck = false
  return input
}

function languageOptions(select: HTMLSelectElement, inherit = false) {
  if (inherit) select.add(new Option('Use shared language', ''))
  for (const language of languages)
    select.add(new Option(languageNames[language], language))
}

function disclosure(label: string, className: string) {
  const details = element('details', className)
  details.append(element('summary', '', label))
  return details
}

function report(output: HTMLOutputElement, action: () => void) {
  try {
    action()
    output.textContent = ''
  } catch (error) {
    output.textContent = error instanceof Error ? error.message : String(error)
  }
}

function sourceControls(editor: Editor, preset: VidroPreset) {
  const details = disclosure('Source inputs', 'source-details')
  const panel = element('div', 'source-panel')
  const value = textArea(editor.value)
  value.id = `source-${preset}-value`
  const before = textArea(editor.originalValue)
  before.id = `source-${preset}-original`
  if (preset !== 'default')
    panel.append(field(`Original value (${preset})`, before))
  panel.append(field(`Value (${preset})`, value))
  const feedback = element('output', 'feedback')
  feedback.setAttribute('aria-live', 'polite')
  const actions = element('div', 'source-actions')
  actions.append(
    button('Apply source', () =>
      report(feedback, () => {
        if (preset !== 'default') editor.originalValue = before.value
        editor.value = value.value
        before.value = editor.originalValue
        value.value = editor.value
      }),
    ),
  )
  panel.append(actions, feedback)
  details.append(panel)
  editor.addEventListener('vidro-change', ({ detail }) => {
    if (document.activeElement !== value) value.value = detail.value
  })
  return details
}

function fileControls(editor: Editor) {
  const details = disclosure('File inputs', 'source-details')
  const panel = element('div', 'source-panel')
  const select = element('select')
  select.id = 'file-select'
  const id = textInput()
  const title = textInput()
  const icon = textInput()
  icon.placeholder = 'Optional URL or path'
  const language = element('select')
  languageOptions(language, true)
  const before = textArea('')
  const value = textArea('')
  const feedback = element('output', 'feedback')
  feedback.setAttribute('aria-live', 'polite')
  let selectedIndex = 0
  let nextId = 1
  const refresh = () => {
    const files = editor.files
    select.replaceChildren(
      ...files.map((file, index) => new Option(file.id, String(index))),
    )
    selectedIndex = Math.min(selectedIndex, Math.max(0, files.length - 1))
    select.value = String(selectedIndex)
    const file = files[selectedIndex]
    id.value = file?.id ?? ''
    title.value = file?.headerTitle ?? ''
    icon.value = file?.icon ?? ''
    language.value = file?.language ?? ''
    before.value = file?.originalValue ?? ''
    value.value = file?.value ?? ''
    for (const input of [
      select,
      id,
      title,
      icon,
      language,
      before,
      value,
      apply,
      remove,
    ])
      input.disabled = !file
  }
  select.addEventListener('change', () => {
    selectedIndex = Number(select.value)
    refresh()
  })
  const apply = button('Apply file', () =>
    report(feedback, () => {
      editor.files = editor.files.map((file, index) =>
        index === selectedIndex
          ? {
              id: id.value,
              originalValue: before.value,
              value: value.value,
              ...(title.value ? { headerTitle: title.value } : {}),
              ...(icon.value ? { icon: icon.value } : {}),
              ...(language.value
                ? { language: language.value as VidroLanguage }
                : {}),
            }
          : file,
      )
      refresh()
    }),
  )
  const add = button('Add file', () =>
    report(feedback, () => {
      let newId = `file-${nextId++}.ts`
      while (editor.files.some((file) => file.id === newId))
        newId = `file-${nextId++}.ts`
      selectedIndex = editor.files.length
      editor.files = [
        ...editor.files,
        { id: newId, originalValue: '', value: '// A new file\n' },
      ]
      refresh()
    }),
  )
  const remove = button('Remove file', () =>
    report(feedback, () => {
      editor.files = editor.files.filter(
        (_file, index) => index !== selectedIndex,
      )
      refresh()
    }),
  )
  panel.append(
    field('Selected file', select),
    field('File ID', id),
    field('File title', title),
    field('File icon', icon),
    field('File language', language),
    field('Original file value', before),
    field('Modified file value', value),
  )
  const actions = element('div', 'source-actions')
  actions.append(apply, add, remove)
  panel.append(actions, feedback)
  details.append(panel)
  refresh()
  return details
}

function eventLog(editor: Editor) {
  const details = disclosure('Events · 0', 'event-details')
  const summary = details.querySelector('summary')
  const empty = element('p', 'event-empty', 'No editing events yet.')
  const list = element('ol', 'event-list')
  let count = 0
  for (const name of [
    'vidro-change',
    'vidro-type-start',
    'vidro-type-leave',
  ] as const) {
    editor.addEventListener(name, ({ detail }) => {
      count++
      if (summary) summary.textContent = `Events · ${count}`
      empty.hidden = true
      const item = element('li')
      const snippet = JSON.stringify(
        detail.value.length > 90
          ? `${detail.value.slice(0, 90)}…`
          : detail.value,
      )
      item.append(
        element('strong', '', `${name} · ${detail.origin}`),
        element('span', '', snippet),
      )
      list.prepend(item)
      while (list.children.length > 12) list.lastElementChild?.remove()
    })
  }
  details.append(empty, list)
  return details
}

const grid = query<HTMLDivElement>('#preview-grid')
const editors = presets.map(({ preset, title, description, headerTitle }) => {
  const card = element('article', 'preset-card')
  card.dataset.preset = preset
  const heading = element('div', 'preset-heading')
  const mode = element('span', 'mode-label', 'Read only')
  mode.dataset.mode = preset
  heading.append(element('h2', '', title), mode)
  const slot = element('div', 'preview-slot')
  const editor = document.createElement('vidro-editor')
  editor.id = `preview-${preset}`
  editor.setAttribute('aria-label', `${title} preview`)
  editor.preset = preset
  editor.headerTitle = headerTitle
  editor.language = 'typescript'
  editor.value = modified
  editor.originalValue = original
  if (preset === 'diff-list') editor.files = initialFiles
  const tools = element('div', 'card-tools')
  tools.append(
    preset === 'diff-list'
      ? fileControls(editor)
      : sourceControls(editor, preset),
    eventLog(editor),
  )
  slot.append(editor)
  card.append(
    heading,
    element('p', 'preset-description', description),
    slot,
    tools,
  )
  grid.append(card)
  return editor
})

const feedback = query<HTMLOutputElement>('#settings-feedback')
query<HTMLFormElement>('#settings-form').addEventListener('submit', (event) =>
  event.preventDefault(),
)

function control<T extends HTMLInputElement | HTMLSelectElement>(name: string) {
  return query<T>(`#control-${name}`)
}

for (const key of [
  'header',
  'clipboard',
  'languageSelector',
  'editable',
] as const) {
  const input = control<HTMLInputElement>(key)
  input.addEventListener('change', () =>
    report(feedback, () => {
      for (const editor of editors) editor[key] = input.checked
      if (key === 'editable') {
        const mode = query<HTMLElement>('[data-mode="default"]')
        mode.textContent = input.checked ? 'Editable' : 'Read only'
        mode.dataset.editable = String(input.checked)
      }
    }),
  )
}

for (const key of ['headerTitle', 'icon'] as const) {
  const input = control<HTMLInputElement>(key)
  input.addEventListener('input', () =>
    report(feedback, () => {
      for (const editor of editors) editor[key] = input.value || undefined
    }),
  )
}
query<HTMLButtonElement>('#sample-icon').addEventListener('click', () => {
  const input = control<HTMLInputElement>('icon')
  input.value = fileIcon
  input.dispatchEvent(new Event('input', { bubbles: true }))
})

const language = control<HTMLSelectElement>('language')
languageOptions(language)
language.value = 'typescript'
language.addEventListener('change', () =>
  report(feedback, () => {
    for (const editor of editors)
      editor.language = language.value as VidroLanguage
  }),
)

const defaultFont = editors[0].fontFamily
const font = control<HTMLInputElement>('fontFamily')
font.value = defaultFont
font.addEventListener('change', () =>
  report(feedback, () => {
    for (const editor of editors) editor.fontFamily = font.value
  }),
)
for (const key of ['fontSize', 'lineHeight', 'debounceMs'] as const) {
  const input = control<HTMLInputElement>(key)
  input.addEventListener('change', () =>
    report(feedback, () => {
      for (const editor of editors) editor[key] = input.valueAsNumber
    }),
  )
}

const frameInputs = [
  ...document.querySelectorAll<HTMLInputElement>('[data-frame]'),
]
for (const input of frameInputs) {
  const suffix = input.dataset.frame
  const property =
    suffix === 'focus-ring-color'
      ? '--vidro-focus-ring-color'
      : `--vidro-frame-${suffix}`
  input.addEventListener('input', () => {
    for (const editor of editors) {
      if (input.value.trim()) editor.style.setProperty(property, input.value)
      else editor.style.removeProperty(property)
    }
  })
}

const height = query<HTMLInputElement>('#preview-height')
height.addEventListener('change', () =>
  report(feedback, () => {
    if (height.value && !height.validity.valid)
      throw new RangeError(
        'Preview max height must be between 120 and 1200 pixels',
      )
    for (const editor of editors)
      editor.style.maxHeight = height.value
        ? `${height.valueAsNumber}px`
        : 'none'
  }),
)

let theme: VidroTheme = 'light'
const themeToggle = query<HTMLButtonElement>('#theme-toggle')
themeToggle.addEventListener('click', () => {
  theme = theme === 'light' ? 'dark' : 'light'
  setTheme(theme)
  document.documentElement.dataset.theme = theme
  const label = `Switch to ${theme === 'light' ? 'dark' : 'light'} theme`
  themeToggle.setAttribute('aria-label', label)
  themeToggle.title = label
})

query<HTMLButtonElement>('#reset-settings').addEventListener('click', () => {
  query<HTMLFormElement>('#settings-form').reset()
  font.value = defaultFont
  language.value = 'typescript'
  for (const name of [
    'header',
    'clipboard',
    'languageSelector',
    'editable',
    'fontFamily',
    'fontSize',
    'lineHeight',
    'debounceMs',
  ])
    control<HTMLInputElement>(name).dispatchEvent(new Event('change'))
  language.dispatchEvent(new Event('change'))
  for (const name of ['headerTitle', 'icon'])
    control<HTMLInputElement>(name).dispatchEvent(new Event('input'))
  editors.forEach((editor, index) => {
    editor.headerTitle = presets[index].headerTitle
  })
  for (const input of frameInputs) input.dispatchEvent(new Event('input'))
  height.dispatchEvent(new Event('change'))
})

try {
  await Promise.all(editors.map((editor) => editor.whenReady()))
  document.body.dataset.ready = 'true'
} catch (error) {
  document.body.dataset.ready = 'false'
  feedback.textContent =
    error instanceof Error ? error.message : 'Preview initialization failed'
}

// The website embeds this built public-package playground as one page section.
if (new URLSearchParams(location.search).get('embed') === '1') {
  document.documentElement.dataset.embedded = 'true'
  const wordmark = document.querySelector('.wordmark')
  if (wordmark) wordmark.textContent = 'Live preview'
  function reportSize() {
    window.parent.postMessage(
      {
        type: 'vidro-playground-size',
        height: document.body.getBoundingClientRect().height,
      },
      window.location.origin,
    )
  }
  const observer = new ResizeObserver(reportSize)
  observer.observe(document.body)
  window.addEventListener('message', (event) => {
    if (
      event.source === window.parent &&
      event.origin === window.location.origin &&
      event.data?.type === 'vidro-playground-measure'
    )
      reportSize()
  })
  window.addEventListener('pagehide', () => observer.disconnect(), {
    once: true,
  })
  reportSize()
}
