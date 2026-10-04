'use client'

import { useEffect, useRef, useState } from 'react'
import type { HomeCopy } from './home-locale'
import { useFrameRevisionReload } from './use-frame-revision-reload'

export function HeroEditor({ copy }: { copy: HomeCopy }) {
  const frame = useRef<HTMLIFrameElement>(null)
  const visible = useRef(false)
  const [height, setHeight] = useState(290)

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
    const target = frame.current
    if (!target) return
    const observer = new IntersectionObserver(([entry]) => {
      visible.current = Boolean(entry?.isIntersecting)
      target.contentWindow?.postMessage(
        { type: 'vidro-hero-playback', visible: visible.current },
        window.location.origin,
      )
    })
    observer.observe(target)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="mt-8 w-full max-w-[42rem] text-left">
      <iframe
        className="block w-full border-0 bg-transparent [color-scheme:light]"
        onLoad={() =>
          frame.current?.contentWindow?.postMessage(
            { type: 'vidro-hero-playback', visible: visible.current },
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
