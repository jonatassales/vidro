'use client'

import { useEffect, useRef, useState } from 'react'
import type { HomeCopy } from './home-locale'
import { useFrameRevisionReload } from './use-frame-revision-reload'

export function EditorPlayground({ copy }: { copy: HomeCopy }) {
  const frame = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(1500)

  useFrameRevisionReload(frame, '/playground/revision.json')

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (
        event.origin !== window.location.origin ||
        event.source !== frame.current?.contentWindow
      )
        return
      const data = event.data
      if (
        data?.type !== 'vidro-playground-size' ||
        !Number.isFinite(data.height)
      )
        return
      setHeight(Math.max(400, Math.min(20000, Math.ceil(data.height))))
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  return (
    <section
      aria-labelledby="playground-title"
      className="relative scroll-mt-10 border-y border-line/70 px-3 py-20 sm:px-6"
      id="playground"
    >
      <div className="mx-auto max-w-[1480px]">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            {copy.playgroundLabel}
          </p>
          <h2
            className="mt-4 text-balance text-3xl font-medium tracking-[-0.03em] sm:text-4xl"
            id="playground-title"
          >
            {copy.playgroundTitle}
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted">
            {copy.playgroundDescription}
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-line bg-white/50 shadow-glass">
          <iframe
            className="block w-full border-0"
            loading="lazy"
            onLoad={() =>
              frame.current?.contentWindow?.postMessage(
                { type: 'vidro-playground-measure' },
                window.location.origin,
              )
            }
            ref={frame}
            src="/playground/index.html?embed=1"
            style={{ height }}
            title={copy.playgroundTitle}
          />
        </div>
      </div>
    </section>
  )
}
