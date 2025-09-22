const axios = require('axios');

const API_URL = 'https://api.householdplanetkenya.co.ke';

async function finalApiTest() {
  console.log('🔥 Final API Endpoints Test...');
  
  try {
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'admin@householdplanet.co.ke',
      password: 'Admin@2025'
    });
    const token = loginResponse.data.accessToken;

    const endpoints = [
      '/api/admin/dashboard',
      '/api/admin/stats', 
      '/api/admin/analytics',
      '/api/dashboard'
    ];

    console.log('\n🧪 Testing all endpoints...');
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${API_URL}${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ ${endpoint} - WORKING`);
      } catch (error) {
        console.log(`❌ ${endpoint} - ${error.response?.status || 'ERROR'}`);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

finalApiTest();