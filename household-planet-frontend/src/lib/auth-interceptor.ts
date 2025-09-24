// Disabled auth interceptor to prevent unwanted logouts
export const setupAuthInterceptor = () => {
  // Auth interceptor disabled - let components handle auth state
  console.log('Auth interceptor disabled to prevent logout issues');
};