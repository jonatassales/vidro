'use client'

import {
  CopyButton,
  CrackedGlassBackground,
  GithubStars,
  LanguageSwitcher,
  VidroLogo,
} from '@vidro/react'
import {
  HOME_LOCALE_LANG,
  HOME_LOCALE_STORAGE_KEY,
  type HomeLocale,
  isHomeLocale,
} from '@vidro/react/locale'
import { useEffect, useState } from 'react'
import { EditorPlayground } from './editor-playground'
import { Footer } from './footer'
import { FrameworkMarquee } from './framework-marquee'
import { HeroEditor } from './hero-editor'
import { HOME_COPY } from './home-locale'
import { Pricing } from './pricing'

export function HomeExperience({ stars }: { stars: number | null }) {
  const [locale, setLocale] = useState<HomeLocale>('en')
  const copy = HOME_COPY[locale]

  useEffect(() => {
    const url = new URL(window.location.href)
    const hinted = url.searchParams.get('locale')
    const stored = window.localStorage.getItem(HOME_LOCALE_STORAGE_KEY)
    if (isHomeLocale(hinted)) {
      setLocale(hinted)
      window.localStorage.setItem(HOME_LOCALE_STORAGE_KEY, hinted)
      url.searchParams.delete('locale')
      window.history.replaceState(
        null,
        '',
        `${url.pathname}${url.search}${url.hash}`,
      )
    } else if (isHomeLocale(stored)) setLocale(stored)
  }, [])

  useEffect(() => {
    document.documentElement.lang = HOME_LOCALE_LANG[locale]
  }, [locale])

  function selectLocale(next: HomeLocale) {
    setLocale(next)
    window.localStorage.setItem(HOME_LOCALE_STORAGE_KEY, next)
  }

  return (
    <div className="relative min-h-dvh overflow-x-hidden" id="top">
      <header className="absolute inset-x-0 top-0 z-20 border-b border-white/50 bg-white/60 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-2 px-3 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
            <a
              aria-label="Vidro"
              className="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
              href="#top"
            >
              <VidroLogo />
            </a>
            <LanguageSwitcher onValueChange={selectLocale} value={locale} />
          </div>
          <nav
            aria-label={copy.product}
            className="flex shrink-0 items-center gap-3 sm:gap-6"
          >
            <a
              className="hidden rounded-sm text-xs font-medium focus-visible:outline-2 focus-visible:outline-offset-4 sm:block"
              href="#playground"
            >
              {copy.playgroundLabel}
            </a>
            <a
              className="rounded-sm text-xs font-medium focus-visible:outline-2 focus-visible:outline-offset-4"
              href="#pricing"
            >
              {copy.pricing}
            </a>
            <a
              className="hidden rounded-sm text-xs font-medium focus-visible:outline-2 focus-visible:outline-offset-4 sm:block"
              href="/editor-api.md"
            >
              {copy.docs}
            </a>
            <GithubStars
              count={stars}
              href="https://github.com/jonatassales/vidro"
            />
          </nav>
        </div>
      </header>
      <main>
        <section
          className="relative flex min-h-[88dvh] items-center justify-center px-5 pb-20 pt-28"
          aria-labelledby="hero-title"
        >
          <CrackedGlassBackground />
          <div className="relative z-10 mx-auto flex w-full max-w-[42rem] flex-col items-center text-center">
            <h1
              className="text-[3.5rem] font-medium leading-none tracking-[-0.05em] sm:text-[5rem]"
              id="hero-title"
            >
              Vidro
            </h1>
            <p className="mt-5 text-balance text-xl font-medium leading-snug sm:text-2xl">
              {copy.slogan}
            </p>
            <HeroEditor copy={copy} />
            <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted">
              {copy.description}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                className="inline-flex min-h-11 items-center gap-5 rounded-lg bg-foreground px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-foreground/85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
                href="#playground"
              >
                {copy.tryEditor}
                <span aria-hidden="true">↓</span>
              </a>
              <div className="flex min-h-11 items-center gap-5 rounded-lg border border-line/80 bg-white/50 px-4 shadow-glass backdrop-blur-md">
                <code className="font-mono text-xs">import 'vidro'</code>
                <CopyButton label={copy.copyImport} text="import 'vidro'" />
              </div>
            </div>
            <FrameworkMarquee copy={copy} />
          </div>
        </section>
        <EditorPlayground copy={copy} />
        <Pricing copy={copy} />
      </main>
      <Footer copy={copy} />
    </div>
  )
}
