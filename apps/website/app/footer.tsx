'use client'

// Footer spacing adapted from SmoothUI footer-2; source and MIT notice: ../vendor/smoothui/.
import '@neongate-ai/orbz/react-types'
import '@neongate-ai/orbz/browser'
import { VidroLogo } from '@vidro/react'
import { motion, useReducedMotion } from 'motion/react'
import type { HomeCopy } from './home-locale'

export function Footer({ copy }: { copy: HomeCopy }) {
  const reduceMotion = useReducedMotion()
  return (
    <footer className="border-t border-line bg-white/40">
      <div className="mx-auto max-w-6xl px-6 pb-8 pt-16">
        <motion.div
          className="max-w-xs"
          initial={false}
          transition={{ duration: reduceMotion ? 0 : 0.4 }}
          viewport={{ once: true }}
          whileInView={reduceMotion ? {} : { y: [10, 0] }}
        >
          <a
            aria-label="Vidro"
            className="inline-flex rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4"
            href="#top"
          >
            <VidroLogo />
          </a>
          <p className="mt-5 text-sm leading-relaxed text-muted">
            {copy.footerDescription}
          </p>
        </motion.div>
        <div className="mt-14 flex justify-end border-t border-line pt-7 font-mono text-[10px] text-muted">
          <p className="inline-flex items-center gap-2">
            <a
              className="inline-grid size-[18px] shrink-0 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
              href="https://neongate.com.br/"
              rel="noopener noreferrer"
              target="_blank"
            >
              <span className="sr-only">Open Neongate in a new tab</span>
              <span aria-hidden="true" className="inline-grid size-[18px] place-items-center">
                <orb-z reduced-motion="system" size="18px" state="idle" />
              </span>
            </a>
            <span>Neongate © 2026</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
