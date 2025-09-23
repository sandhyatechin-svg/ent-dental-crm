/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow cross-origin requests from mobile devices
  experimental: {
    allowedDevOrigins: ['172.20.10.3', '192.168.1.58', '192.168.1.79', 'localhost']
  }
}

module.exports = nextConfig

