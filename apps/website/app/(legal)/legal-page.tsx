import { VidroLogo } from '@vidro/react'
import type { ReactNode } from 'react'
import { Footer } from '../footer'
import { HOME_COPY } from '../home-locale'

export function LegalPage({
  children,
  eyebrow,
  title,
}: {
  children: ReactNode
  eyebrow: string
  title: string
}) {
  return (
    <>
      <header className="border-b border-line bg-white/40">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-6">
          <a
            className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4"
            href="/"
          >
            <VidroLogo />
            <span className="sr-only">Vidro home</span>
          </a>
          <a
            className="rounded-sm font-mono text-xs text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4"
            href="/"
          >
            Back to Vidro ↗
          </a>
        </div>
      </header>
      <main className="mx-auto min-h-[60vh] max-w-6xl px-6 py-20 sm:py-28">
        <article className="max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-medium tracking-[-0.04em] sm:text-5xl">
            {title}
          </h1>
          <div className="mt-10 border-t border-line pt-8 text-sm leading-7 text-foreground/80 sm:text-base">
            {children}
          </div>
        </article>
      </main>
      <Footer copy={HOME_COPY.en} />
    </>
  )
}
