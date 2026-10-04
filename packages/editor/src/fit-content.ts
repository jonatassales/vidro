import type * as monaco from 'monaco-editor/editor/editor.api.js'

type ContentEditor = Pick<
  monaco.editor.ICodeEditor,
  'getContentHeight' | 'onDidContentSizeChange'
>

export interface ContentFit {
  refresh(): void
  dispose(): void
}

/** Size a Monaco surface to its content while allowing a constrained host to shrink it. */
export function fitContent(
  surface: HTMLElement,
  editors: readonly ContentEditor[],
): ContentFit {
  let frame: number | undefined
  let disposed = false
  let lastHeight = 0

  function measure(): void {
    frame = undefined
    if (disposed) return
    const height = Math.ceil(
      Math.max(0, ...editors.map((editor) => editor.getContentHeight())),
    )
    if (height <= 0 || height === lastHeight) return
    lastHeight = height
    surface.style.setProperty('--vidro-internal-content-height', `${height}px`)
  }

  function refresh(): void {
    if (disposed || frame !== undefined) return
    frame = requestAnimationFrame(measure)
  }

  const subscriptions = editors.map((editor) =>
    editor.onDidContentSizeChange(refresh),
  )
  refresh()
  return {
    refresh,
    dispose() {
      disposed = true
      if (frame !== undefined) cancelAnimationFrame(frame)
      for (const subscription of subscriptions) subscription.dispose()
      surface.style.removeProperty('--vidro-internal-content-height')
    },
  }
}
