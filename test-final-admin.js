const axios = require('axios');

async function testFinalAdmin() {
  try {
    const loginResponse = await axios.post('https://api.householdplanetkenya.co.ke/api/auth/login', {
      email: 'householdplanet819@gmail.com',
      password: 'Admin@2025'
    });

    const token = loginResponse.data.accessToken; // Use accessToken not access_token
    console.log('✅ Login successful');
    console.log('👤 Role:', loginResponse.data.user.role);

    // Test admin endpoints
    const endpoints = [
      '/api/admin/dashboard',
      '/api/admin/inventory/alerts',
      '/api/admin/products',
      '/api/admin/categories'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`https://api.householdplanetkenya.co.ke${endpoint}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log(`✅ ${endpoint} - Working`);
      } catch (error) {
        console.log(`❌ ${endpoint} - ${error.response?.status}`);
      }
    }

  } catch (error) {
    console.log('❌ Login failed:', error.response?.data);
  }
}

testFinalAdmin();