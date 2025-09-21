// Environment-based configuration
const getApiUrl = () => {
  // Production URLs
  const PRODUCTION_API_URL = 'https://api.householdplanetkenya.co.ke';
  const PRODUCTION_SITE_URL = 'https://householdplanetkenya.co.ke';
  
  // Development URLs
  const DEV_API_URL = 'http://localhost:3001';
  const DEV_SITE_URL = 'http://localhost:3000';
  
  // Use environment variable if available, otherwise use production URLs
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || PRODUCTION_API_URL;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || PRODUCTION_SITE_URL;
  
  // Force production URLs in production environment
  if (process.env.NODE_ENV === 'production') {
    return {
      BASE_URL: PRODUCTION_API_URL,
      SITE_URL: PRODUCTION_SITE_URL,
      ENVIRONMENT: 'production'
    };
  }
  
  // Fallback for development when production APIs are not available
  if (process.env.NODE_ENV === 'development' && apiUrl.includes('householdplanetkenya.co.ke')) {
    console.warn('⚠️ Production API not available, using fallback');
    return {
      BASE_URL: DEV_API_URL,
      SITE_URL: DEV_SITE_URL,
      ENVIRONMENT: 'development-fallback'
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

// Warn about localhost URLs in production
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production' && API_CONFIG.BASE_URL.includes('localhost')) {
  console.warn('⚠️ LOCALHOST DETECTED IN PRODUCTION BUILD!');
  console.warn('Current API_BASE_URL:', API_CONFIG.BASE_URL);
  console.warn('This should be updated to production URL');
}