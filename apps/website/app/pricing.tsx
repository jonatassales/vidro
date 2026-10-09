'use client'

// Adapted from SmoothUI pricing-1; source and MIT notice: ../vendor/smoothui/.
import { motion, useReducedMotion } from 'motion/react'
import Image from 'next/image'
import { useState } from 'react'
import type { HomeCopy } from './home-locale'
import { PIX_COPY_PASTE } from './pix'

export function Pricing({ copy }: { copy: HomeCopy }) {
  const reduceMotion = useReducedMotion()
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>(
    'idle',
  )

  async function copyPix() {
    try {
      await navigator.clipboard.writeText(PIX_COPY_PASTE)
      setCopyState('copied')
    } catch {
      setCopyState('error')
    }
  }

  return (
    <section
      aria-labelledby="pricing-title"
      className="relative scroll-mt-10 px-6 py-24 sm:py-32"
      id="pricing"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            {copy.pricing}
          </p>
          <h2
            className="mt-4 text-balance text-3xl font-medium tracking-[-0.03em] sm:text-4xl"
            id="pricing-title"
          >
            {copy.pricingTitle}
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted">
            {copy.pricingDescription}
          </p>
        </div>
        <motion.div
          className="relative mx-auto max-w-lg overflow-hidden rounded-2xl border border-line bg-white/70 p-8 shadow-glass backdrop-blur-xl sm:p-10"
          initial={false}
          transition={{ duration: reduceMotion ? 0 : 0.4 }}
          viewport={{ once: true, amount: 0.2 }}
          whileInView={reduceMotion ? {} : { y: [12, 0] }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-ice via-ice-strong to-white"
          />
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-xl font-medium">Vidro</h3>
            <span className="rounded-full border border-line bg-ice/60 px-3 py-1 font-mono text-[10px] uppercase tracking-wider">
              {copy.supportBadge}
            </span>
          </div>
          <div className="my-8 flex items-baseline gap-2">
            <span className="text-2xl text-muted">R$</span>
            <span className="text-7xl font-medium leading-none tracking-[-0.06em]">
              5
            </span>
          </div>
          <p className="mb-8 text-sm leading-relaxed text-muted">
            {copy.planDescription}
          </p>
          <div className="mb-6 flex justify-center">
            <Image
              alt={copy.pixQrAlt}
              className="h-auto w-64 max-w-full rounded-lg bg-white"
              height={256}
              src="/support/pix-r5.svg"
              unoptimized
              width={256}
            />
          </div>
          <p className="mb-5 text-sm leading-relaxed text-muted">
            {copy.pixInstructions}
          </p>
          <button
            className="flex min-h-12 w-full items-center justify-center rounded-lg bg-foreground px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-foreground/85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
            onClick={() => void copyPix()}
            type="button"
          >
            {copy.pixCopy}
          </button>
          <p aria-live="polite" className="mt-3 text-center text-sm text-muted">
            {copyState === 'copied'
              ? copy.pixCopied
              : copyState === 'error'
                ? copy.pixCopyError
                : ''}
          </p>
          <details className="mt-4 text-sm">
            <summary className="cursor-pointer rounded-sm text-muted focus-visible:outline-2 focus-visible:outline-offset-4">
              {copy.pixCodeLabel}
            </summary>
            <textarea
              aria-label={copy.pixCodeLabel}
              className="mt-3 w-full resize-y rounded-lg border border-line bg-white p-3 font-mono text-xs leading-relaxed focus-visible:outline-2 focus-visible:outline-offset-2"
              readOnly
              rows={5}
              value={PIX_COPY_PASTE}
            />
          </details>
          <p className="mt-4 text-center text-xs leading-relaxed text-muted">
            {copy.supportOptional}
          </p>
          <div className="mt-8 border-t border-line pt-7">
            <h4 className="mb-5 font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
              {copy.included}
            </h4>
            <ul className="space-y-4">
              {copy.features.map((feature) => (
                <li className="flex items-start gap-3 text-sm" key={feature}>
                  <svg
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    viewBox="0 0 20 20"
                  >
                    <path d="m4 10 4 4 8-8" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
