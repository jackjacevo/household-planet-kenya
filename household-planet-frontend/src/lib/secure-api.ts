import axios from 'axios';

const ALLOWED_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.householdplanetkenya.co.ke';

// Validate URL to prevent SSRF
const validateApiUrl = (url: string): string => {
  if (!url.startsWith(ALLOWED_API_URL)) {
    throw new Error('Invalid API URL');
  }
  return url;
};

export const secureApiClient = axios.create({
  baseURL: ALLOWED_API_URL,
  timeout: 10000,
});

secureApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Validate the full URL
  if (config.url && config.baseURL) {
    validateApiUrl(`${config.baseURL}${config.url}`);
  }
  
  return config;
});

export { validateApiUrl };