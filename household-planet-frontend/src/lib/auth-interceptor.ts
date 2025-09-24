// Simplified auth interceptor - no token validation to prevent conflicts
export const setupAuthInterceptor = () => {
  const originalFetch = window.fetch;
  
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    // Only handle 401 responses, don't pre-validate tokens
    try {
      const response = await originalFetch(input, init);
      
      // If we get a 401, clear auth data and redirect
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      
      return response;
    } catch (error) {
      return originalFetch(input, init);
    }
  };
};