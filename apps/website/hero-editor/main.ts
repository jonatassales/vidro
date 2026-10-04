import { setTheme, type VidroDiffFile, type VidroPreset } from 'vidro'
import { createWipeTransition } from './wipe'
import './style.css'

const host = document.querySelector<HTMLDivElement>('#editor')
const canvas = document.querySelector<HTMLCanvasElement>('#wipe')
if (!host || !canvas) throw new Error('Missing hero editor host')

const CODE = [
  'import "vidro"',
  'const editor = document.createElement("vidro-editor")',
  '',
  'editor.headerTitle = "hello.ts"',
  'editor.value = "A clear view of your code."',
  'document.body.append(editor)',
].join('\n')
const ORIGINAL = CODE.replace('hello.ts', 'untitled.ts').replace(
  'A clear view of your code.',
  'Hello, world!',
)
const FILES: readonly VidroDiffFile[] = [
  {
    id: 'app.ts',
    language: 'typescript',
    originalValue: 'const theme = "light"\neditor.header = false',
    value: 'const theme = "dark"\neditor.header = true',
  },
  {
    id: 'styles.css',
    language: 'css',
    originalValue: 'vidro-editor {\n  border-radius: 4px;\n}',
    value: 'vidro-editor {\n  border-radius: 12px;\n}',
  },
]
const PRESETS: readonly VidroPreset[] = [
  'default',
  'default',
  'diff',
  'diff-split',
  'diff-list',
  'default',
]
const SCENE_MS = 3000
const lines = CODE.split('\n')
const firstLine = lines[0] ?? ''
const secondLine = lines[1] ?? ''
const words = secondLine.match(/\S+\s*/g) ?? []
const typingSteps = [
  ...Array.from(firstLine, (_, index) => ({
    at: ((index + 1) / firstLine.length) * 800,
    value: firstLine.slice(0, index + 1),
  })),
  ...words.map((_, index) => ({
    at: 1100 + (index / words.length) * 800,
    value: `${firstLine}\n${words.slice(0, index + 1).join('')}`,
  })),
  { at: 2200, value: CODE },
]
const editor = document.createElement('vidro-editor')
editor.language = 'typescript'
editor.fontSize = 13
editor.lineHeight = 22
const wipe = createWipeTransition(canvas)
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
const forcedColors = window.matchMedia('(forced-colors: active)')
const lifecycle = new AbortController()
let ready = false
let parentVisible = false
let hovered = false
let focused = false
let elapsed = 0
let lastFrame = 0
let frame = 0
let slot = 0
let scene = 0
let sceneStarted = 0
let switchedFile = false
let typed = 0

function applyScene(next: number) {
  scene = next
  sceneStarted = elapsed
  switchedFile = false
  typed = 0
  setTheme(next === 1 || next === 5 ? 'dark' : 'light')
  editor.header = next !== 1
  editor.clipboard = true
  editor.headerTitle = next === 4 ? 'Changes' : 'hello.ts'
  editor.editable = next === 5
  editor.originalValue = ORIGINAL
  editor.value = next === 5 ? '' : CODE
  if (next === 4) editor.files = FILES
  editor.preset = PRESETS[next] ?? 'default'
  document.body.dataset.scene = String(next + 1)
}

applyScene(0)
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

const resizeObserver = new ResizeObserver(reportSize)
resizeObserver.observe(editor)

function tick(now: number) {
  if (lastFrame) elapsed += now - lastFrame
  lastFrame = now
  const nextSlot = Math.floor(elapsed / SCENE_MS)
  if (nextSlot !== slot) {
    slot = nextSlot
    wipe.play(() => applyScene(slot % PRESETS.length))
  }
  const sceneElapsed = elapsed - sceneStarted
  if (scene === 4 && !switchedFile && sceneElapsed >= 1500) {
    // Exercise the same accessible disclosure controls as a visitor.
    editor
      .querySelector<HTMLButtonElement>('button[aria-label="Collapse app.ts"]')
      ?.click()
    editor
      .querySelector<HTMLButtonElement>(
        'button[aria-label="Expand styles.css"]',
      )
      ?.click()
    switchedFile = true
  }
  if (scene === 5) {
    let step = typingSteps[typed]
    while (step && sceneElapsed >= step.at) {
      editor.value = step.value
      typed += 1
      step = typingSteps[typed]
    }
  }
  frame = requestAnimationFrame(tick)
}

function syncPlayback() {
  cancelAnimationFrame(frame)
  lastFrame = 0
  const motionDisabled = reducedMotion.matches || forcedColors.matches
  const playing =
    ready &&
    parentVisible &&
    !document.hidden &&
    !hovered &&
    !focused &&
    !motionDisabled
  document.body.dataset.playing = String(playing)
  if (playing) frame = requestAnimationFrame(tick)
  else wipe.finish()
  if (motionDisabled) {
    elapsed = 0
    slot = 0
    if (scene !== 0) applyScene(0)
  }
}

window.addEventListener(
  'message',
  (event: MessageEvent) => {
    if (
      event.source !== window.parent ||
      event.origin !== window.location.origin
    )
      return
    if (
      event.data?.type !== 'vidro-hero-playback' ||
      typeof event.data.visible !== 'boolean'
    )
      return
    parentVisible = event.data.visible
    syncPlayback()
  },
  { signal: lifecycle.signal },
)

host.addEventListener(
  'pointerenter',
  () => {
    hovered = true
    syncPlayback()
  },
  { signal: lifecycle.signal },
)
host.addEventListener(
  'pointerleave',
  () => {
    hovered = false
    syncPlayback()
  },
  { signal: lifecycle.signal },
)
host.addEventListener(
  'focusin',
  () => {
    focused = true
    syncPlayback()
  },
  { signal: lifecycle.signal },
)
host.addEventListener(
  'focusout',
  () => {
    queueMicrotask(() => {
      focused = editor.contains(document.activeElement)
      syncPlayback()
    })
  },
  { signal: lifecycle.signal },
)
document.addEventListener('visibilitychange', syncPlayback, {
  signal: lifecycle.signal,
})
reducedMotion.addEventListener('change', syncPlayback, {
  signal: lifecycle.signal,
})
forcedColors.addEventListener('change', syncPlayback, {
  signal: lifecycle.signal,
})

void editor
  .whenReady()
  .then(() => {
    if (lifecycle.signal.aborted) return
    ready = true
    document.body.dataset.ready = 'true'
    reportSize()
    syncPlayback()
  })
  .catch(() => {
    document.body.dataset.ready = 'error'
  })

window.addEventListener('pageshow', syncPlayback, { signal: lifecycle.signal })
window.addEventListener('pagehide', (event) => {
  if (event.persisted) {
    cancelAnimationFrame(frame)
    lastFrame = 0
    wipe.finish()
    return
  }
  lifecycle.abort()
  cancelAnimationFrame(frame)
  resizeObserver.disconnect()
  wipe.dispose()
  editor.remove()
})
