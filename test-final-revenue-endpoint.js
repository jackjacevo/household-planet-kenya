const axios = require('axios');

async function testFinalRevenueEndpoint() {
  try {
    console.log('🔍 Testing revenue endpoint with correct admin credentials...');
    
    // Login with correct admin credentials
    const loginResponse = await axios.post('https://api.householdplanetkenya.co.ke/api/auth/login', {
      email: 'householdplanet819@gmail.com',
      password: 'Admin@2025'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Admin login successful');
    
    // Test revenue endpoint with auth
    const revenueResponse = await axios.get('https://api.householdplanetkenya.co.ke/api/admin/analytics/revenue?period=monthly', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Revenue endpoint working:', revenueResponse.status);
    console.log('📊 Revenue data:', JSON.stringify(revenueResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testFinalRevenueEndpoint();