const axios = require('axios');

async function testCorrectToken() {
  try {
    const loginResponse = await axios.post('https://api.householdplanetkenya.co.ke/api/auth/login', {
      email: 'householdplanet819@gmail.com',
      password: 'Admin@2025'
    });
    
    const token = loginResponse.data.accessToken; // Use accessToken, not access_token
    console.log('✅ Login successful, role:', loginResponse.data.user.role);
    
    // Test revenue endpoint
    const revenueResponse = await axios.get('https://api.householdplanetkenya.co.ke/api/admin/analytics/revenue?period=monthly', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Revenue endpoint working:', revenueResponse.status);
    console.log('📊 Revenue data:', revenueResponse.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testCorrectToken();