import { setTheme } from 'vidro'
import './style.css'

const host = document.querySelector<HTMLDivElement>('#editor')
if (!host) throw new Error('Missing hero editor host')

const editor = document.createElement('vidro-editor')
editor.headerTitle = 'app.ts'
editor.language = 'typescript'
editor.value = [
  'import "vidro"',
  '',
  'const editor = document.querySelector("vidro-editor")',
  'editor?.addEventListener("vidro-change", ({ detail }) => {',
  '  console.log(detail.value)',
  '})',
].join('\n')
host.append(editor)

function reportSize() {
  window.parent.postMessage(
    {
      type: 'vidro-hero-size',
      height: Math.ceil(editor.getBoundingClientRect().height + 4),
    },
    window.location.origin,
  )
}

new ResizeObserver(reportSize).observe(editor)

function applyTheme(theme: 'light' | 'dark') {
  setTheme(theme)
  document.documentElement.dataset.theme = theme
}

applyTheme(
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
)
window.addEventListener('message', (event: MessageEvent) => {
  if (event.source !== window.parent || event.origin !== window.location.origin)
    return
  if (event.data?.type !== 'vidro-hero-theme') return
  if (event.data.theme === 'light' || event.data.theme === 'dark')
    applyTheme(event.data.theme)
})

void editor.whenReady().then(() => {
  document.body.dataset.ready = 'true'
  reportSize()
})
