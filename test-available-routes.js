const axios = require('axios');

async function testAvailableRoutes() {
  try {
    console.log('🔍 Testing available routes...');
    
    // Test common routes that should exist
    const routes = [
      '/health',
      '/auth/login',
      '/auth/register', 
      '/products',
      '/categories',
      '/admin/dashboard',
      '/api/health',
      '/api/auth/login',
      '/api/products'
    ];
    
    for (const route of routes) {
      try {
        const response = await axios.get(`https://api.householdplanetkenya.co.ke${route}`);
        console.log(`✅ ${route}: ${response.status} - Available`);
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log(`🔐 ${route}: ${error.response.status} - Available (requires auth)`);
        } else if (error.response?.status === 405) {
          console.log(`📝 ${route}: ${error.response.status} - Available (wrong method)`);
        } else {
          console.log(`❌ ${route}: ${error.response?.status || 'No response'} - ${error.response?.data?.message || error.message}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAvailableRoutes();