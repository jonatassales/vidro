'use client'

// Footer spacing adapted from SmoothUI footer-2; source and MIT notice: ../vendor/smoothui/.
import '@neongate-ai/orbz/react-types'
import '@neongate-ai/orbz/browser'
import { VidroLogo } from '@vidro/react'
import { motion, useReducedMotion } from 'motion/react'
import Image from 'next/image'
import type { HomeCopy } from './home-locale'
import { SocialLinks } from './social-links'

const backingLinks = [
  {
    label: 'SmoothUI',
    href: 'https://smoothui.dev/',
    icon: '/backed-by/smoothui.ico',
  },
  {
    label: 'Vercel',
    href: 'https://vercel.com/',
    icon: '/backed-by/vercel.svg',
  },
  { label: 'Jotai', href: 'https://jotai.org/', icon: '/backed-by/jotai.svg' },
  {
    label: 'Monaco',
    href: 'https://microsoft.github.io/monaco-editor/',
    icon: '/backed-by/microsoft.svg',
  },
  {
    label: 'Codex',
    href: 'https://openai.com/codex/',
    icon: '/backed-by/codex.svg',
  },
] as const

export function Footer({ copy }: { copy: HomeCopy }) {
  const reduceMotion = useReducedMotion()

  return (
    <footer className="border-t border-line bg-white/40">
      <div className="mx-auto max-w-6xl px-6 pb-8 pt-16">
        <motion.div
          className="grid gap-12 sm:grid-cols-[2fr_1fr_1fr]"
          initial={false}
          transition={{ duration: reduceMotion ? 0 : 0.4 }}
          viewport={{ once: true }}
          whileInView={reduceMotion ? {} : { y: [10, 0] }}
        >
          <div>
            <a
              aria-label="Vidro"
              className="inline-flex rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4"
              href="#top"
            >
              <VidroLogo />
            </a>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">
              {copy.footerDescription}
            </p>
          </div>
          <nav aria-label={copy.product}>
            <h2 className="mb-5 font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
              {copy.product}
            </h2>
            <ul className="space-y-3">
              <li>
                <a
                  className="rounded-sm text-sm text-foreground/80 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4"
                  href="/license/"
                >
                  {copy.license}
                </a>
              </li>
              <li>
                <a
                  className="rounded-sm text-sm text-foreground/80 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4"
                  href="/policies/"
                >
                  {copy.policies}
                </a>
              </li>
            </ul>
          </nav>
          <nav aria-label={copy.backedBy}>
            <h2 className="mb-5 font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
              {copy.backedBy}
            </h2>
            <ul className="space-y-3">
              {backingLinks.map(({ label, href, icon }) => (
                <li key={label}>
                  <a
                    className="inline-flex items-center gap-2 rounded-sm text-sm text-foreground/80 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4"
                    href={href}
                    title={label}
                  >
                    <Image
                      alt=""
                      className={`size-[18px] shrink-0 object-contain ${label === 'SmoothUI' ? 'invert' : ''}`}
                      height={18}
                      src={icon}
                      unoptimized
                      width={18}
                    />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </motion.div>
        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-7 font-mono text-[10px] text-muted sm:flex-row sm:items-center sm:justify-between">
          <p className="inline-flex items-center gap-2">
            <a
              className="inline-grid size-[18px] shrink-0 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
              href="https://neongate.com.br/"
              rel="noopener noreferrer"
              target="_blank"
            >
              <span className="sr-only">Open Neongate in a new tab</span>
              <span
                aria-hidden="true"
                className="inline-grid size-[18px] place-items-center"
              >
                <orb-z reduced-motion="system" size="18px" state="idle" />
              </span>
            </a>
            <span>Neongate © 2026</span>
          </p>
          <SocialLinks label={copy.socialLinks} />
        </div>
      </div>
    </footer>
  )
}
