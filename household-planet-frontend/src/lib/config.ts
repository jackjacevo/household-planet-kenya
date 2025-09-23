// Environment-based configuration
const getApiUrl = () => {
  // Production URLs (matches your production env)
  const PRODUCTION_API_URL = '/api';  // Use relative path for Next.js API routes in production
  const PRODUCTION_SITE_URL = 'https://householdplanetkenya.co.ke';

  // Development URLs
  const DEV_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const DEV_SITE_URL = 'http://localhost:3000';

  // In production, use the environment variable or fallback to production API
  if (process.env.NODE_ENV === 'production') {
    return {
      BASE_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
      SITE_URL: PRODUCTION_SITE_URL,
      ENVIRONMENT: 'production'
    };
  }

  // Development
  return {
    BASE_URL: DEV_API_URL,
    SITE_URL: DEV_SITE_URL,
    ENVIRONMENT: 'development'
  };
};

export const API_CONFIG = getApiUrl();

// Debug function to check configuration
export const debugConfig = () => {
  console.log('API Configuration:', {
    BASE_URL: API_CONFIG.BASE_URL,
    SITE_URL: API_CONFIG.SITE_URL,
    ENVIRONMENT: API_CONFIG.ENVIRONMENT,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
  });
};

// Production validation
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  if (API_CONFIG.BASE_URL.includes('localhost')) {
    console.error('❌ LOCALHOST DETECTED IN PRODUCTION!');
  } else if (API_CONFIG.BASE_URL === '/api') {
    console.log('✅ Production API URL configured correctly');
  }
}