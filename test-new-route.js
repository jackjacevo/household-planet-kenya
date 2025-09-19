const axios = require('axios');

async function testNewRoute() {
  try {
    // Login
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'householdplanet819@gmail.com',
      password: 'Admin@2025'
    });
    
    const { accessToken } = loginResponse.data;
    const headers = { Authorization: `Bearer ${accessToken}` };
    
    // Test new route
    const response = await axios.get('http://localhost:3001/api/admin/activity-stats', { headers });
    console.log('✅ Activity Stats:', response.status, response.data);
    
  } catch (error) {
    console.log('❌ Error:', error.response?.status, error.response?.data || error.message);
  }
}

testNewRoute();