import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@vidro/react', '@vidro/design-system'],
  trailingSlash: true,
  async headers() {
    return ['/hero-editor/:path*', '/playground/:path*'].map((source) => ({
      source,
      headers: [{ key: 'X-Robots-Tag', value: 'noindex' }],
    }))
  },
}

export default nextConfig
