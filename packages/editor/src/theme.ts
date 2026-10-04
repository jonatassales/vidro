export type VidroTheme = 'light' | 'dark'

type EffectiveTheme = VidroTheme | 'hc-light' | 'hc-black'

type ThemeState = Readonly<{
  requested: VidroTheme
  effective: EffectiveTheme
}>

let requestedTheme: VidroTheme = 'light'
let forcedColors: MediaQueryList | undefined
let darkScheme: MediaQueryList | undefined
const listeners = new Set<(state: ThemeState) => void>()

function state(): ThemeState {
  return {
    requested: requestedTheme,
    effective: forcedColors?.matches
      ? darkScheme?.matches
        ? 'hc-black'
        : 'hc-light'
      : requestedTheme,
  }
}

function notify(): void {
  const current = state()
  for (const listener of listeners) listener(current)
}

function observeSystemColors(): void {
  if (forcedColors) return
  forcedColors = window.matchMedia('(forced-colors: active)')
  darkScheme = window.matchMedia('(prefers-color-scheme: dark)')
  forcedColors.addEventListener('change', notify)
  darkScheme.addEventListener('change', notify)
}

/** Select one native editor theme for all Vidro instances in this runtime. */
export function setTheme(next: VidroTheme): void {
  if (typeof next !== 'string') throw new TypeError('theme must be a string')
  if (next !== 'light' && next !== 'dark')
    throw new RangeError('Unsupported Vidro theme')
  if (requestedTheme === next) return
  requestedTheme = next
  notify()
}

/** Internal subscription also seeds a newly mounted editor or frame. */
export function subscribeTheme(
  listener: (state: ThemeState) => void,
): () => void {
  observeSystemColors()
  listeners.add(listener)
  listener(state())
  return () => listeners.delete(listener)
}
