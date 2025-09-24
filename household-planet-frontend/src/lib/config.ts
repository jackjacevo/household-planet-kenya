// Simple configuration without debug logging
const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.householdplanetkenya.co.ke';
    return {
      BASE_URL: baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`,
      SITE_URL: 'https://householdplanetkenya.co.ke',
      ENVIRONMENT: 'production'
    };
  }

  const devUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  return {
    BASE_URL: devUrl.endsWith('/api') ? devUrl : `${devUrl}/api`,
    SITE_URL: 'http://localhost:3000',
    ENVIRONMENT: 'development'
  };
};

export const API_CONFIG = getApiUrl();