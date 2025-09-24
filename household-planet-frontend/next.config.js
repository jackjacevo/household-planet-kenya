/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
  },

  async rewrites() {
    if (process.env.NODE_ENV === 'production') {
      return [
        {
          source: '/api/:path*',
          destination: 'https://api.householdplanetkenya.co.ke/api/:path*',
        },
      ];
    }
    return [];
  },

  images: {
    domains: ['images.unsplash.com', 'householdplanetkenya.co.ke'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'householdplanetkenya.co.ke',
      },
    ],
    unoptimized: true,
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        ws: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig