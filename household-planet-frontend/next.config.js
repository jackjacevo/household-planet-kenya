/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
  },

  // API rewrite for production - proxy /api/* to backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://household-planet-backend:3001/api/:path*',
      },
    ];
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

  experimental: {
    webVitalsAttribution: ['CLS', 'LCP']
  },
  webpack: (config, { dev, isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        ws: false,
        net: false,
        tls: false,
        crypto: false,
      };
      
      // Suppress all WebSocket related warnings
      config.ignoreWarnings = [
        /Critical dependency: the request of a dependency is an expression/,
        /Module not found: Can't resolve 'ws'/,
        /WebSocket connection disabled/,
        /Failed to construct 'WebSocket'/,
      ];
      

    }
    return config;
  },
}

module.exports = nextConfig