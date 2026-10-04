'use client'

import { type RefObject, useEffect } from 'react'

export function useFrameRevisionReload(
  frame: RefObject<HTMLIFrameElement | null>,
  revisionUrl: string,
) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return
    let revision: string | undefined
    let fetching = false
    const controller = new AbortController()
    const timer = window.setInterval(async () => {
      if (fetching) return
      fetching = true
      try {
        const response = await fetch(revisionUrl, {
          cache: 'no-store',
          signal: controller.signal,
        })
        if (!response.ok) return
        const data = await response.json()
        if (typeof data.revision !== 'string') return
        if (revision && revision !== data.revision)
          frame.current?.contentWindow?.location.reload()
        revision = data.revision
      } catch {
        // Keep the current preview while the development server restarts.
      } finally {
        fetching = false
      }
    }, 1500)
    return () => {
      window.clearInterval(timer)
      controller.abort()
    }
  }, [frame, revisionUrl])
}
