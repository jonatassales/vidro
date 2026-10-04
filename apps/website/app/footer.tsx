'use client'

// Adapted from SmoothUI footer-2; source and MIT notice: ../vendor/smoothui/.
import { VidroLogo } from '@vidro/react'
import { motion, useReducedMotion } from 'motion/react'
import type { HomeCopy } from './home-locale'

export function Footer({ copy }: { copy: HomeCopy }) {
  const reduceMotion = useReducedMotion()
  const groups = [
    {
      label: copy.product,
      links: [
        { label: copy.playgroundLabel, href: '#playground' },
        { label: copy.pricing, href: '#pricing' },
      ],
    },
    {
      label: copy.resources,
      links: [
        { label: copy.docs, href: '/editor-api.md' },
        { label: 'GitHub ↗', href: 'https://github.com/jonatassales/vidro' },
      ],
    },
  ]
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
          {groups.map((group) => (
            <nav aria-label={group.label} key={group.label}>
              <h3 className="mb-5 font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
                {group.label}
              </h3>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <a
                      className="rounded-sm text-sm text-foreground/80 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4"
                      href={link.href}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </motion.div>
        <div className="mt-14 flex flex-wrap justify-between gap-3 border-t border-line pt-7 font-mono text-[10px] text-muted">
          <p>© 2026 Vidro</p>
          <a
            className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4"
            href="#top"
          >
            {copy.backToTop} ↑
          </a>
        </div>
      </div>
    </footer>
  )
}
