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
    setTheme(
      window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light',
    )
  }, [])

  useEffect(() => {
    frame.current?.contentWindow?.postMessage(
      { type: 'vidro-hero-theme', theme },
      window.location.origin,
    )
  }, [theme])

  return (
    <div className="mt-8 w-full max-w-[42rem] text-left">
      <div className="mb-2 flex justify-end">
        <button
          aria-label={
            theme === 'light' ? copy.switchToDark : copy.switchToLight
          }
          className="flex size-9 items-center justify-center rounded-full border border-line/80 bg-white/70 text-foreground shadow-glass backdrop-blur-md transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          onClick={() =>
            setTheme((current) => (current === 'light' ? 'dark' : 'light'))
          }
          title={theme === 'light' ? copy.switchToDark : copy.switchToLight}
          type="button"
        >
          {theme === 'light' ? (
            <svg
              aria-hidden="true"
              className="size-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="M20.8 13a9 9 0 0 1-9.8-9.8A9 9 0 1 0 20.8 13Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            </svg>
          ) : (
            <svg
              aria-hidden="true"
              className="size-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                cx="12"
                cy="12"
                r="4"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.5"
              />
            </svg>
          )}
        </button>
      </div>
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
