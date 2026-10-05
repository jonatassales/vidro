'use client'

import { useState } from 'react'

export function CopyButton({
  getText,
  label = 'Copy',
  text,
}: {
  getText?: () => string
  label?: string
  text?: string
}) {
  const [copied, setCopied] = useState(false)

  async function onCopy() {
    const value = getText ? getText() : (text ?? '')
    if (!value) {
      return
    }
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button
      aria-label={copied ? 'Copied' : label}
      aria-live="polite"
      className="grid size-8 shrink-0 place-items-center rounded-md text-muted transition-colors duration-150 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground motion-reduce:transition-none"
      onClick={() => {
        void onCopy()
      }}
      type="button"
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </button>
  )
}

function CopyIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 16 16">
      <rect height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" width="9" x="5" y="5" />
      <path
        d="M4 11H3.5A1.5 1.5 0 0 1 2 9.5v-6A1.5 1.5 0 0 1 3.5 2h6A1.5 1.5 0 0 1 11 3.5V4"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 16 16">
      <path d="M3.5 8.5 6.5 11.5 12.5 4.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}
