'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { HomeCopy } from './home-locale'

const ecosystems = [
  { name: 'React', icon: 'react' },
  { name: 'Next.js', icon: 'nextjs' },
  { name: 'Vue', icon: 'vuejs' },
  { name: 'Svelte', icon: 'svelte' },
  { name: 'Angular', icon: 'angular' },
  { name: 'SolidJS', icon: 'solidjs' },
  { name: 'Astro', icon: 'astro' },
] as const

export function FrameworkMarquee({ copy }: { copy: HomeCopy }) {
  const [paused, setPaused] = useState(false)

  return (
    <div className="mt-10 w-full">
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
        <span className="rounded-full bg-foreground px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-white">
          Web Component
        </span>
        <code className="rounded-full border border-line bg-white/70 px-2.5 py-1 font-mono text-xs text-foreground shadow-glass">
          {'<vidro-editor>'}
        </code>
        <span className="text-xs text-muted">{copy.frameworks}</span>
      </div>
      <div className="relative w-full overflow-hidden py-1 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] motion-reduce:overflow-x-auto motion-reduce:[mask-image:none]">
        <div
          className={`flex w-max animate-[vidro-marquee_32s_linear_infinite] hover:[animation-play-state:paused] motion-reduce:animate-none ${paused ? '[animation-play-state:paused]' : ''}`}
        >
          {[0, 1].map((track) => (
            <ul
              aria-hidden={track === 1}
              className={`flex shrink-0 items-center gap-3 pr-3 ${track === 1 ? 'motion-reduce:hidden' : ''}`}
              key={track}
            >
              {ecosystems.map(({ name, icon }) => (
                <li key={`${track}-${name}`}>
                  <span className="group inline-flex h-10 items-center gap-2 rounded-full border border-line/80 bg-white/70 px-3.5 text-xs font-medium text-foreground/70 shadow-glass backdrop-blur-md transition-colors hover:border-ice-strong hover:text-foreground">
                    <Image
                      alt=""
                      className="size-5 shrink-0 grayscale transition-[filter] duration-200 group-hover:grayscale-0"
                      height={20}
                      src={`/frameworks/${icon}.svg`}
                      unoptimized
                      width={20}
                    />
                    {name}
                  </span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
      <button
        className="mx-auto mt-2 block rounded-full border border-line/80 bg-white/70 px-3 py-1 font-mono text-[10px] text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground motion-reduce:hidden"
        onClick={() => setPaused((current) => !current)}
        type="button"
      >
        {paused ? copy.resumeCarousel : copy.pauseCarousel}
      </button>
    </div>
  )
}
