/** @type {import('next').NextConfig} */
const path = require('path');
const nextConfig = {

  
  // Server external packages
  serverExternalPackages: ['sharp'],
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'householdplanetkenya.co.ke',
      },
      {
        protocol: 'https',
        hostname: 'api.householdplanetkenya.co.ke',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
      },
      {
        protocol: 'http',
        hostname: 'backend',
        port: '3001',
        pathname: '/uploads/**',
      },
    ],
  },
  
  // Experimental features
  experimental: {
    optimizePackageImports: ['lucide-react', '@heroicons/react'],
    turbo: {
      resolveAlias: {
        '@': './src',
      },
    },
  },
  // Performance & Security Headers
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/sw-dev.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/sw-minimal.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },

      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: process.env.NODE_ENV === 'production' 
              ? "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://images.unsplash.com https://res.cloudinary.com https://householdplanetkenya.co.ke https://api.householdplanetkenya.co.ke; font-src 'self'; connect-src 'self' https://api.householdplanetkenya.co.ke https://*.householdplanetkenya.co.ke wss://api.householdplanetkenya.co.ke; frame-src 'self' https://maps.google.com https://www.google.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
              : "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://images.unsplash.com https://res.cloudinary.com http://localhost:3001; font-src 'self'; connect-src 'self' http://localhost:3001 ws://localhost:3001; frame-src 'self' https://maps.google.com https://www.google.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
          },
        ],
      },
    ];
  },

  
  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/shop',
        destination: '/products',
        permanent: true,
      },
    ];
  },
  

  
  // Output optimization
  output: 'standalone',
  
  // Power optimizations
  poweredByHeader: false,
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Static optimization
  trailingSlash: false,
}

module.exports = nextConfig