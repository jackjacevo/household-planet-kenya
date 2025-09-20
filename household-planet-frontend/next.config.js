/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.householdplanetkenya.co.ke',
  },
  images: {
    domains: ['images.unsplash.com', 'api.householdplanetkenya.co.ke'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'api.householdplanetkenya.co.ke',
      },
    ],
    unoptimized: true,
  },
}

module.exports = nextConfig