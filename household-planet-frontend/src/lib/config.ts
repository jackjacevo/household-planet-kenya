// Centralized configuration to prevent localhost calls
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.householdplanetkenya.co.ke',
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://householdplanetkenya.co.ke',
  ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT || 'production'
};

// Debug function to check configuration
export const debugConfig = () => {
  console.log('API Configuration:', {
    BASE_URL: API_CONFIG.BASE_URL,
    SITE_URL: API_CONFIG.SITE_URL,
    ENVIRONMENT: API_CONFIG.ENVIRONMENT,
    NODE_ENV: process.env.NODE_ENV
  });
};

// Ensure no localhost URLs in production
if (typeof window !== 'undefined' && API_CONFIG.BASE_URL.includes('localhost')) {
  console.error('❌ LOCALHOST DETECTED IN PRODUCTION!');
  console.error('Current API_BASE_URL:', API_CONFIG.BASE_URL);
  console.error('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
}