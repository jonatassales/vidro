import {
  type EditorPresentation,
  LANGUAGE_LABELS,
  type VidroLanguage,
} from './configuration.js'
import type { DiffStats } from './diff-stats.js'
import { formatUiNumber, UI_COPY, type VidroUiLocale } from './localization.js'

export function languageSelect(
  label: string,
  onChange: (language: VidroLanguage) => void,
  locale: VidroUiLocale = 'en',
): HTMLSelectElement {
  const select = document.createElement('select')
  select.className = 'vidro-editor__language-select'
  select.setAttribute('aria-label', label)
  for (const [id, name] of Object.entries(LANGUAGE_LABELS)) {
    const option = document.createElement('option')
    option.value = id
    option.textContent = id === 'plaintext' ? UI_COPY[locale].plainText : name
    select.append(option)
  }
  select.addEventListener('change', () => {
    onChange(select.value as VidroLanguage)
  })
  return select
}

export interface ChromeIcon {
  readonly element: HTMLSpanElement
  update(url: string | undefined, title: string | undefined): void
}

export function chromeIcon(locale: VidroUiLocale = 'en'): ChromeIcon {
  const element = document.createElement('span')
  element.className = 'vidro-editor__icon'
  const image = document.createElement('img')
  image.className = 'vidro-editor__icon-image'
  image.width = 18
  image.height = 18
  const fallback = document.createElement('span')
  fallback.className = 'vidro-editor__icon-fallback'
  fallback.textContent = '<>'
  fallback.hidden = true
  element.append(image, fallback)
  image.addEventListener('error', () => {
    image.hidden = true
    fallback.hidden = false
  })
  return {
    element,
    update(url, title) {
      element.hidden = url === undefined
      if (url === undefined) {
        image.removeAttribute('src')
        return
      }
      image.alt = title ? '' : UI_COPY[locale].documentIcon
      fallback.setAttribute(
        'aria-label',
        title ? '' : UI_COPY[locale].documentIcon,
      )
      fallback.setAttribute('aria-hidden', title ? 'true' : 'false')
      if (image.getAttribute('src') !== url) {
        image.hidden = false
        fallback.hidden = true
        image.src = url
      }
    },
  }
}

export function copyButton(label: string): HTMLButtonElement {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'vidro-editor__copy-button'
  button.setAttribute('aria-label', label)
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  icon.setAttribute('viewBox', '0 0 24 24')
  icon.setAttribute('width', '16')
  icon.setAttribute('height', '16')
  icon.setAttribute('fill', 'none')
  icon.setAttribute('stroke', 'currentColor')
  icon.setAttribute('stroke-width', '1.8')
  icon.setAttribute('aria-hidden', 'true')
  const back = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  back.setAttribute('d', 'M8 4h9a2 2 0 0 1 2 2v10')
  const front = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  front.setAttribute('x', '5')
  front.setAttribute('y', '8')
  front.setAttribute('width', '11')
  front.setAttribute('height', '12')
  front.setAttribute('rx', '2')
  icon.append(back, front)
  button.append(icon)
  return button
}

export function copyStatus(): HTMLSpanElement {
  const status = document.createElement('span')
  status.className = 'vidro-editor__copy-status'
  status.setAttribute('role', 'status')
  status.setAttribute('aria-live', 'polite')
  return status
}

export async function copyText(
  value: string,
  status: HTMLElement,
  locale: VidroUiLocale = 'en',
): Promise<void> {
  try {
    await navigator.clipboard.writeText(value)
    status.textContent = UI_COPY[locale].copied
  } catch {
    status.textContent = UI_COPY[locale].copyFailed
  }
}

export interface SummaryChrome {
  readonly element: HTMLDivElement
  readonly status: HTMLSpanElement
  update(
    presentation: EditorPresentation,
    language: VidroLanguage,
    totals?: DiffStats,
  ): void
}

export function createSummaryChrome(
  onLanguage: (language: VidroLanguage) => void,
  getValue: () => string,
  locale: VidroUiLocale = 'en',
): SummaryChrome {
  const element = document.createElement('div')
  element.className = 'vidro-editor__header'
  const identity = document.createElement('div')
  identity.className = 'vidro-editor__header-identity'
  const messages = UI_COPY[locale]
  const icon = chromeIcon(locale)
  const title = document.createElement('span')
  title.className = 'vidro-editor__header-title'
  const totalCount = document.createElement('span')
  totalCount.className = 'vidro-editor__total-count'
  const addedCount = document.createElement('span')
  addedCount.className = 'vidro-editor__added-count'
  const deletedCount = document.createElement('span')
  deletedCount.className = 'vidro-editor__deleted-count'
  totalCount.append(addedCount, deletedCount)
  identity.append(icon.element, title, totalCount)
  const actions = document.createElement('div')
  actions.className = 'vidro-editor__header-actions'
  const selector = languageSelect(messages.editorLanguage, onLanguage, locale)
  const copy = copyButton(messages.copyEditor)
  const status = copyStatus()
  copy.addEventListener('click', () => {
    void copyText(getValue(), status, locale)
  })
  actions.append(selector, copy)
  element.append(identity, actions, status)
  return {
    element,
    status,
    update(presentation, language, totals) {
      element.hidden = !presentation.header
      icon.update(presentation.icon, presentation.headerTitle)
      title.textContent =
        presentation.headerTitle ??
        (presentation.preset === 'diff-list'
          ? messages.changedFiles(presentation.files.length)
          : '')
      title.hidden =
        presentation.headerTitle === undefined &&
        presentation.preset !== 'diff-list'
      totalCount.hidden = presentation.preset !== 'diff-list'
      addedCount.textContent = `+${formatUiNumber(locale, totals?.added ?? 0)}`
      deletedCount.textContent = `−${formatUiNumber(locale, totals?.deleted ?? 0)}`
      totalCount.setAttribute(
        'aria-label',
        messages.lines(totals?.added ?? 0, totals?.deleted ?? 0, true),
      )
      selector.hidden =
        !presentation.languageSelector || presentation.preset === 'diff-list'
      selector.value = language
      copy.hidden =
        !presentation.clipboard || presentation.preset === 'diff-list'
      status.textContent = ''
    },
  }
}
