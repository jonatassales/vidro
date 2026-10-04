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
      <div className="relative w-full overflow-hidden py-1 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] motion-reduce:overflow-x-auto motion-reduce:[mask-image:none]">
        <div
          className={`flex w-max animate-[vidro-marquee_21.333s_linear_infinite] hover:[animation-play-state:paused] motion-reduce:animate-none ${paused ? '[animation-play-state:paused]' : ''}`}
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
        aria-label={paused ? copy.resumeCarousel : copy.pauseCarousel}
        className="mx-auto mt-2 flex size-7 items-center justify-center rounded-full border border-line/80 bg-white/70 text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground motion-reduce:hidden"
        onClick={() => setPaused((current) => !current)}
        type="button"
      >
        {paused ? (
          <svg
            aria-hidden="true"
            className="size-3"
            fill="none"
            viewBox="0 0 16 16"
          >
            <path
              d="m5 3 8 5-8 5V3Z"
              stroke="currentColor"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg
            aria-hidden="true"
            className="size-3"
            fill="none"
            viewBox="0 0 16 16"
          >
            <path
              d="M5 3v10m6-10v10"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.5"
            />
          </svg>
        )}
      </button>
    </div>
  )
}
