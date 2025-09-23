// Environment-based configuration
const getApiUrl = () => {
  // Production URLs (matches your production env)
  const PRODUCTION_API_URL = 'https://api.householdplanetkenya.co.ke/api';
  const PRODUCTION_SITE_URL = 'https://householdplanetkenya.co.ke';

  // Development URLs
  const DEV_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const DEV_SITE_URL = 'http://localhost:3000';

  // In production, determine the best API URL
  if (process.env.NODE_ENV === 'production') {
    // If we have the environment variable, use it directly with /api
    if (process.env.NEXT_PUBLIC_API_URL) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL.includes('/api')
        ? process.env.NEXT_PUBLIC_API_URL
        : `${process.env.NEXT_PUBLIC_API_URL}/api`;

      // Debug logging
      console.log('🔧 Config Debug:', {
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        baseUrl
      });

      return {
        BASE_URL: baseUrl,
        SITE_URL: PRODUCTION_SITE_URL,
        ENVIRONMENT: 'production'
      };
    } else {
      // Fallback to production API URL
      console.log('🔧 Config Debug: Using fallback API URL:', PRODUCTION_API_URL);
      return {
        BASE_URL: PRODUCTION_API_URL,
        SITE_URL: PRODUCTION_SITE_URL,
        ENVIRONMENT: 'production'
      };
    }
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
  } else if (API_CONFIG.BASE_URL.includes('api.householdplanetkenya.co.ke')) {
    console.log('✅ Production API URL configured correctly:', API_CONFIG.BASE_URL);
  } else {
    console.warn('⚠️ Unexpected API URL in production:', API_CONFIG.BASE_URL);
  }
}