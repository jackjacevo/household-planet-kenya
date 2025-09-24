/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },

  // Optimize build performance
  poweredByHeader: false,
  compress: true,

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts'],

  },

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
  },

  async headers() {
    return [
      {
        source: '/_next/static/css/(.*).css',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/css',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/js/(.*).js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
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



  // Enable static optimization
  trailingSlash: false,
  generateEtags: true,



  // Production optimizations
  ...(process.env.NODE_ENV === 'production' && {
    compiler: {
      removeConsole: {
        exclude: ['error'],
      },
    },
  }),
}

module.exports = nextConfig