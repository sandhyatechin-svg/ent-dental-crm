/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint during build for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript type checking during build for deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  // Output configuration for static export (if needed)
  output: 'standalone',
  // Image optimization
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig

