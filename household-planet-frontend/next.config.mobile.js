/** @type {import('next').NextConfig} */
const path = require('path');
const nextConfig = {
  // Mobile-optimized performance settings
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@heroicons/react', 'framer-motion', 'recharts'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
    esmExternals: true,
    serverComponentsExternalPackages: ['sharp'],
    webVitalsAttribution: ['CLS', 'FCP', 'FID', 'LCP', 'TTFB'],
    scrollRestoration: true,
    ppr: true,
  },
  
  // Mobile-optimized image settings
  images: {
    domains: ['images.unsplash.com', 'localhost', 'res.cloudinary.com', 'householdplanet.co.ke'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000,
    deviceSizes: [320, 420, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    loader: 'default',
    quality: 75,
    priority: true,
    placeholder: 'blur',
  },
  
  compress: true,
  
  // Mobile-optimized webpack config
  webpack: (config, { dev, isServer }) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      minSize: 15000,
      maxSize: 200000,
      maxAsyncRequests: 8,
      maxInitialRequests: 6,
      cacheGroups: {
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: -10,
          chunks: 'all',
        },
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          priority: 10,
          chunks: 'all',
        },
        ui: {
          test: /[\\/]node_modules[\\/](@headlessui|@heroicons|lucide-react)[\\/]/,
          name: 'ui',
          priority: 5,
          chunks: 'all',
        },
        mobile: {
          test: /[\\/](mobile|touch|swipe)[\\/]/,
          name: 'mobile',
          priority: 8,
          chunks: 'all',
        },
      },
    };
    
    if (!dev) {
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      config.optimization.minimize = true;
      config.optimization.providedExports = true;
      config.optimization.innerGraph = true;
      config.optimization.concatenateModules = true;
      config.optimization.mangleExports = true;
      config.optimization.removeAvailableModules = true;
      config.optimization.removeEmptyChunks = true;
      config.optimization.mergeDuplicateChunks = true;
    }
    
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    
    return config;
  },

  // Mobile-optimized headers
  async headers() {
    return [
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
        source: '/sw-mobile.js',
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
        ],
      },
    ];
  },
  
  output: 'standalone',
  poweredByHeader: false,
  
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    styledComponents: false,
    emotion: false,
  },
  
  swcMinify: true,
  trailingSlash: false,
  optimizeFonts: true,
}

module.exports = nextConfig