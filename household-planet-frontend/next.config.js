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
      
      // Disable WebSocket in production
      config.plugins = config.plugins || [];
      config.plugins.push(
        new config.webpack.DefinePlugin({
          'process.env.DISABLE_WEBSOCKET': JSON.stringify('true')
        })
      );
    }
    return config;
  },
}

module.exports = nextConfig