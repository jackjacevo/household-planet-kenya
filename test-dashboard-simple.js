const axios = require('axios');

async function testDashboard() {
  try {
    const response = await axios.get('https://api.householdplanetkenya.co.ke/api/admin/dashboard');
    console.log('✅ Dashboard accessible:', response.status);
  } catch (error) {
    console.log('❌ Dashboard error:', error.response?.status);
    
    // Try with login
    try {
      const login = await axios.post('https://api.householdplanetkenya.co.ke/api/auth/login', {
        email: 'householdplanet819@gmail.com',
        password: 'Admin@2025'
      });
      
      const dashResponse = await axios.get('https://api.householdplanetkenya.co.ke/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${login.data.accessToken}` }
      });
      
      console.log('✅ Dashboard with auth:', dashResponse.status);
      console.log('📊 Data:', dashResponse.data);
      
    } catch (authError) {
      console.log('❌ Auth dashboard error:', authError.response?.status);
    }
  }
}

testDashboard();