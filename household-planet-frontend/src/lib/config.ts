// Environment-based configuration
const getApiUrl = () => {
  // Production URLs (matches your production env)
  const PRODUCTION_API_URL = '/api';  // Use relative path for Next.js rewrite
  const PRODUCTION_SITE_URL = 'https://householdplanetkenya.co.ke';

  // Development URLs
  const DEV_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const DEV_SITE_URL = 'http://localhost:3000';

  // Use environment variable if available, otherwise use relative path for production
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? '/api' : DEV_API_URL);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || PRODUCTION_SITE_URL;

  // Use relative API path in production to leverage Next.js rewrites
  if (process.env.NODE_ENV === 'production') {
    return {
      BASE_URL: PRODUCTION_API_URL,
      SITE_URL: PRODUCTION_SITE_URL,
      ENVIRONMENT: 'production'
    };
  }

  // Development - check if we can reach localhost backend
  if (process.env.NODE_ENV === 'development') {
    return {
      BASE_URL: apiUrl.startsWith('http') ? apiUrl : DEV_API_URL,
      SITE_URL: DEV_SITE_URL,
      ENVIRONMENT: 'development'
    };
  }

  return {
    BASE_URL: apiUrl,
    SITE_URL: siteUrl,
    ENVIRONMENT: process.env.NODE_ENV || 'development'
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
  } else if (API_CONFIG.BASE_URL === 'https://api.householdplanetkenya.co.ke') {
    console.log('✅ Production API URL configured correctly');
  }
}