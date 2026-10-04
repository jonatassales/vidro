const networks = [
  {
    name: 'LinkedIn',
    color: 'hover:text-[#0a66c2] focus-visible:text-[#0a66c2]',
    path: 'M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13M7.12 20.45H3.56V9h3.56zM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.23 0',
  },
  {
    name: 'X',
    color: 'hover:text-black focus-visible:text-black',
    path: 'M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.5 5.4 22H2.2l7.3-8.4L1.8 2h6.5l4.5 6.9L18.9 2Zm-1.1 18h1.7L7.3 3.9H5.5L17.8 20Z',
  },
  {
    name: 'Twitter',
    color: 'hover:text-[#1da1f2] focus-visible:text-[#1da1f2]',
    path: 'M23.95 4.57a10 10 0 0 1-2.82.77 4.93 4.93 0 0 0 2.16-2.72 9.99 9.99 0 0 1-3.13 1.19 4.92 4.92 0 0 0-8.38 4.48A13.98 13.98 0 0 1 1.64 3.15a4.92 4.92 0 0 0 1.52 6.57 4.9 4.9 0 0 1-2.23-.62v.06a4.92 4.92 0 0 0 3.95 4.83 4.94 4.94 0 0 1-2.22.08 4.93 4.93 0 0 0 4.6 3.42A9.87 9.87 0 0 1 0 19.53a13.94 13.94 0 0 0 7.55 2.21c9.06 0 14.01-7.5 14.01-14.01 0-.21 0-.42-.01-.64a10.01 10.01 0 0 0 2.46-2.55Z',
  },
  {
    name: 'GitHub',
    color: 'hover:text-[#6e5494] focus-visible:text-[#6e5494]',
    path: 'M12 .3a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.04c-3.34.72-4.04-1.42-4.04-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.23 1.84 1.23 1.07 1.83 2.81 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.66-.3-5.47-1.34-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23A11.51 11.51 0 0 1 12 6.27c1.02 0 2.04.14 3 .4 2.3-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.62-5.48 5.92.43.37.82 1.1.82 2.22v3.13c0 .32.22.7.83.58A12 12 0 0 0 12 .3Z',
  },
  {
    name: 'Instagram',
    color: 'hover:text-[#e4405f] focus-visible:text-[#e4405f]',
    path: 'M7 0h10a7 7 0 0 1 7 7v10a7 7 0 0 1-7 7H7a7 7 0 0 1-7-7V7a7 7 0 0 1 7-7Zm0 2a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5H7Zm5 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12Zm0 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm6.5-4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z',
  },
] as const

export function SocialLinks({ label }: { label: string }) {
  return (
    <nav
      aria-label={label}
      className="flex items-center gap-2"
      id="social-links"
    >
      {networks.map((network) => (
        <a
          aria-label={network.name}
          className={`inline-grid size-8 cursor-pointer place-items-center rounded-sm text-muted transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${network.color}`}
          href="#social-links"
          key={network.name}
          title={network.name}
        >
          <span className="sr-only">{network.name}</span>
          <svg
            aria-hidden="true"
            className="size-[18px]"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d={network.path} />
          </svg>
        </a>
      ))}
    </nav>
  )
}
