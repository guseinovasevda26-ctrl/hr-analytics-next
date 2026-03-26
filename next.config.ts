import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'hr-analytics-production-a951.up.railway.app'],
    },
  },
}

export default nextConfig
