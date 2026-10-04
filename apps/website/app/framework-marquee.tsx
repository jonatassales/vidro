'use client'

import Image from 'next/image'

const ecosystems = [
  { name: 'React', icon: 'react' },
  { name: 'Next.js', icon: 'nextjs' },
  { name: 'Vue', icon: 'vuejs' },
  { name: 'Svelte', icon: 'svelte' },
  { name: 'Angular', icon: 'angular' },
  { name: 'SolidJS', icon: 'solidjs' },
  { name: 'Astro', icon: 'astro' },
] as const

export function FrameworkMarquee() {
  return (
    <div className="mt-10 w-full">
      <div className="relative w-full overflow-hidden py-1 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] motion-reduce:overflow-x-auto motion-reduce:[mask-image:none]">
        <div className="flex w-max animate-[vidro-marquee_21.333s_linear_infinite] hover:[animation-play-state:paused] motion-reduce:animate-none">
          {[0, 1].map((track) => (
            <ul
              aria-hidden={track === 1}
              className={`flex min-w-[42rem] shrink-0 items-center justify-around gap-10 pr-10 ${track === 1 ? 'motion-reduce:hidden' : ''}`}
              key={track}
            >
              {ecosystems.map(({ name, icon }) => (
                <li key={`${track}-${name}`}>
                  <span className="inline-flex h-10 items-center gap-2.5 whitespace-nowrap text-sm font-medium text-foreground/80">
                    <Image
                      alt=""
                      className="size-8 shrink-0 object-contain"
                      height={32}
                      src={`/frameworks/${icon}.svg`}
                      unoptimized
                      width={32}
                    />
                    {name}
                  </span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </div>
  )
}
