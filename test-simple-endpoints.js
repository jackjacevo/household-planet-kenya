const axios = require('axios');

async function testSimpleEndpoints() {
  try {
    const loginResponse = await axios.post('https://api.householdplanetkenya.co.ke/api/auth/login', {
      email: 'householdplanet819@gmail.com',
      password: 'Admin@2025'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Login successful, role:', loginResponse.data.user.role);
    
    // Test various endpoints
    const endpoints = [
      '/api/auth/profile',
      '/api/products',
      '/api/categories'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`https://api.householdplanetkenya.co.ke${endpoint}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log(`✅ ${endpoint}: ${response.status}`);
      } catch (error) {
        console.log(`❌ ${endpoint}: ${error.response?.status} - ${error.response?.data?.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testSimpleEndpoints();