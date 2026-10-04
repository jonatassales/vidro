'use client'

import { useEffect, useRef, useState } from 'react'
import type { HomeCopy } from './home-locale'
import { useFrameRevisionReload } from './use-frame-revision-reload'

type Theme = 'light' | 'dark'

export function HeroEditor({ copy }: { copy: HomeCopy }) {
  const frame = useRef<HTMLIFrameElement>(null)
  const [theme, setTheme] = useState<Theme>('light')
  const [height, setHeight] = useState(242)

  useFrameRevisionReload(frame, '/hero-editor/revision.json')

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (
        event.origin !== window.location.origin ||
        event.source !== frame.current?.contentWindow ||
        event.data?.type !== 'vidro-hero-size' ||
        !Number.isFinite(event.data.height)
      )
        return
      setHeight(Math.max(100, Math.min(600, Math.ceil(event.data.height))))
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  useEffect(() => {
    const preference = window.matchMedia('(prefers-color-scheme: dark)')
    const syncTheme = () => setTheme(preference.matches ? 'dark' : 'light')
    syncTheme()
    preference.addEventListener('change', syncTheme)
    return () => preference.removeEventListener('change', syncTheme)
  }, [])

  useEffect(() => {
    frame.current?.contentWindow?.postMessage(
      { type: 'vidro-hero-theme', theme },
      window.location.origin,
    )
  }, [theme])

  return (
    <div className="mt-8 w-full max-w-[42rem] text-left">
      <iframe
        className="block w-full border-0"
        onLoad={() =>
          frame.current?.contentWindow?.postMessage(
            { type: 'vidro-hero-theme', theme },
            window.location.origin,
          )
        }
        ref={frame}
        src="/hero-editor/index.html"
        style={{ height }}
        title={copy.heroEditorTitle}
      />
    </div>
  )
}
