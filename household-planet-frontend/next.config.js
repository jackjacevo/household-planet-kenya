/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.householdplanetkenya.co.ke',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'api.householdplanetkenya.co.ke',
      },
      {
        protocol: 'https',
        hostname: 'householdplanetkenya.co.ke',
      },
    ],
  },
}

module.exports = nextConfig