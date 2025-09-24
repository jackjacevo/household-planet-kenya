import { useAuthStore } from './store/authStore';

// Auto-refresh token on API calls
export const setupAuthInterceptor = () => {
  const originalFetch = window.fetch;
  
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const { validateToken, refreshAccessToken, logout } = useAuthStore.getState();
    
    // Check if this is an authenticated request
    const hasAuthHeader = init?.headers && 
      (init.headers as Record<string, string>)['Authorization'];
    
    if (hasAuthHeader) {
      const isValid = await validateToken();
      if (!isValid) {
        const refreshed = await refreshAccessToken();
        if (!refreshed) {
          logout();
          window.location.href = '/login';
          return Promise.reject(new Error('Authentication failed'));
        }
        
        // Update Authorization header with new token
        const newToken = localStorage.getItem('token');
        if (newToken && init?.headers) {
          (init.headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
        }
      }
    }
    
    return originalFetch(input, init);
  };
};