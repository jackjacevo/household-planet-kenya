const axios = require('axios');

async function testUserRole() {
  try {
    const loginResponse = await axios.post('https://api.householdplanetkenya.co.ke/api/auth/login', {
      email: 'householdplanet819@gmail.com',
      password: 'Admin@2025'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Login successful');
    console.log('🔍 User data:', loginResponse.data.user);
    
    // Test dashboard endpoint
    try {
      const dashboardResponse = await axios.get('https://api.householdplanetkenya.co.ke/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Dashboard accessible');
    } catch (error) {
      console.log('❌ Dashboard error:', error.response?.status, error.response?.data?.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testUserRole();