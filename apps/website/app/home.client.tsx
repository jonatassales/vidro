'use client'

import {
  CopyButton,
  CrackedGlassBackground,
  LanguageSwitcher,
  VidroLogo,
} from '@vidro/react'
import type { HomeLocale } from '@vidro/react/locale'
import { BlurOutUp } from './blur-out-up'
import { EditorPlayground } from './editor-playground'
import { Footer } from './footer'
import { FrameworkMarquee } from './framework-marquee'
import { HeroEditor } from './hero-editor'
import { HOME_COPY } from './home-locale'
import { Pricing } from './pricing'

export function HomeExperience({ locale }: { locale: HomeLocale }) {
  const copy = HOME_COPY[locale]

  return (
    <div className="relative min-h-dvh overflow-x-hidden" id="top">
      <header className="absolute inset-x-0 top-0 z-20 border-b border-white/50 bg-white/60 backdrop-blur-xl">
        <div className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-3 px-3 py-3 sm:px-6 lg:grid-cols-[1fr_auto_1fr]">
          <div className="col-start-1 row-start-1 flex min-w-0 items-center gap-1.5 sm:gap-3">
            <a
              aria-label="Vidro"
              className="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
              href="#top"
            >
              <VidroLogo />
            </a>
            <LanguageSwitcher value={locale} />
          </div>
          <div className="col-span-2 row-start-2 flex items-center justify-center gap-2 lg:col-span-1 lg:col-start-2 lg:row-start-1">
            <span className="rounded-full bg-foreground px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-white">
              Web Component
            </span>
            <code className="rounded-full border border-line bg-white/70 px-2.5 py-1 font-mono text-xs text-foreground shadow-glass">
              {'<vidro-editor>'}
            </code>
          </div>
          <nav
            aria-label={copy.product}
            className="col-start-2 row-start-1 justify-self-end lg:col-start-3"
          >
            <a
              className="rounded-sm text-xs font-medium focus-visible:outline-2 focus-visible:outline-offset-4"
              href="#pricing"
            >
              {copy.pricing}
            </a>
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
              <BlurOutUp>Vidro</BlurOutUp>
            </h1>
            <p className="mt-5 text-balance text-xl font-medium leading-snug sm:text-2xl">
              <BlurOutUp>{copy.slogan}</BlurOutUp>
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
            <FrameworkMarquee />
          </div>
        </section>
        <EditorPlayground copy={copy} />
        <Pricing copy={copy} />
      </main>
      <Footer copy={copy} />
    </div>
  )
}
