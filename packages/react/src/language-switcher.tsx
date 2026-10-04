'use client'

import { useEffect, useId, useRef, useState } from 'react'
import {
  HOME_LOCALE_LABELS,
  HOME_LOCALES,
  HOME_LOCALE_LANG,
  type HomeLocale,
} from './locale.js'

const languageNames: Record<HomeLocale, string> = {
  en: 'English',
  'pt-BR': 'Português',
  zh: '中文',
  ja: '日本語',
}

const optionClassName =
  'inline-flex min-h-[1.7rem] shrink-0 items-center justify-center whitespace-nowrap rounded-full border-0 bg-transparent px-[0.7rem] text-[0.72rem] font-[650] tracking-[0.04em] text-muted no-underline transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-foreground motion-reduce:transition-none'

export function LanguageSwitcher({
  onValueChange,
  value,
}: {
  onValueChange?: (next: HomeLocale) => void
  value: HomeLocale
}) {
  const [open, setOpen] = useState(false)
  const [urlSuffix, setUrlSuffix] = useState('')
  const containerRef = useRef<HTMLElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const optionsRef = useRef<HTMLDivElement>(null)
  const optionsId = useId()
  const Container = onValueChange ? 'div' : 'nav'

  useEffect(() => {
    const syncUrlSuffix = () => {
      setUrlSuffix(`${window.location.search}${window.location.hash}`)
    }
    syncUrlSuffix()
    window.addEventListener('hashchange', syncUrlSuffix)
    window.addEventListener('popstate', syncUrlSuffix)
    return () => {
      window.removeEventListener('hashchange', syncUrlSuffix)
      window.removeEventListener('popstate', syncUrlSuffix)
    }
  }, [])

  useEffect(() => {
    if (!open) return

    function dismissOutside(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener('pointerdown', dismissOutside)
    return () => document.removeEventListener('pointerdown', dismissOutside)
  }, [open])

  function closePill() {
    if (optionsRef.current?.contains(document.activeElement)) {
      triggerRef.current?.focus({ preventScroll: true })
    }
    setOpen(false)
  }

  return (
    <Container
      aria-label="Language"
      className="inline-flex w-max max-w-full shrink-0 flex-nowrap items-center rounded-full border border-line/80 bg-white/70 p-[0.2rem] shadow-glass backdrop-blur-[16px]"
      data-state={open ? 'open' : 'idle'}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.preventDefault()
          closePill()
        }
      }}
      onPointerEnter={(event) => {
        if (event.pointerType !== 'touch') setOpen(true)
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== 'touch') closePill()
      }}
      ref={(element) => {
        containerRef.current = element
      }}
      role={onValueChange ? 'group' : undefined}
    >
      <button
        aria-controls={optionsId}
        aria-expanded={open}
        aria-label={`Language: ${languageNames[value]}`}
        className={`${optionClassName} bg-white/90 text-foreground`}
        onClick={() => setOpen(!open)}
        ref={triggerRef}
        type="button"
      >
        {HOME_LOCALE_LABELS[value]}
      </button>
      <div
        aria-hidden={!open}
        className={`grid transition-[grid-template-columns,opacity] duration-250 ease-out motion-reduce:transition-none ${open ? 'grid-cols-[1fr] opacity-100' : 'grid-cols-[0fr] opacity-0'}`}
        id={optionsId}
        inert={!open}
        onClickCapture={closePill}
        ref={optionsRef}
      >
        <div className="min-w-0 overflow-hidden">
          <div className="flex w-max items-center gap-[0.15rem] pl-[0.15rem]">
            {HOME_LOCALES.filter((code) => code !== value).map((code) =>
              onValueChange ? (
                <button
                  aria-label={languageNames[code]}
                  className={optionClassName}
                  key={code}
                  onClick={() => onValueChange(code)}
                  type="button"
                >
                  {HOME_LOCALE_LABELS[code]}
                </button>
              ) : (
                <a
                  aria-label={languageNames[code]}
                  className={optionClassName}
                  href={`/${code}/${urlSuffix}`}
                  hrefLang={HOME_LOCALE_LANG[code]}
                  key={code}
                >
                  {HOME_LOCALE_LABELS[code]}
                </a>
              ),
            )}
          </div>
        </div>
      </div>
    </Container>
  )
}
