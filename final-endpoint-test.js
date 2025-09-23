const axios = require('axios');

async function finalTest() {
  const API_URL = 'https://api.householdplanetkenya.co.ke';
  
  const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
    email: 'admin@householdplanetkenya.co.ke',
    password: 'Admin@2025'
  });
  const token = loginResponse.data.accessToken;

  const missingEndpoints = [
    '/api/admin/stats',
    '/api/admin/analytics', 
    '/api/admin/orders',
    '/api/admin/promo-codes',
    '/api/admin/customers',
    '/api/users'
  ];

  console.log('🔥 Final Missing Endpoints Test:');
  
  for (const endpoint of missingEndpoints) {
    try {
      await axios.get(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ ${endpoint} - NOW WORKING`);
    } catch (error) {
      console.log(`❌ ${endpoint} - Still ${error.response?.status || 'ERROR'}`);
    }
  }
}

finalTest();