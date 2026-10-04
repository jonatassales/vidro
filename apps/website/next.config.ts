import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@vidro/react', '@vidro/design-system'],
  trailingSlash: true,
}

export default nextConfig
