const axios = require('axios');

async function testDirectDashboard() {
  try {
    const response = await axios.get('https://api.householdplanetkenya.co.ke/api/admin/dashboard');
    console.log('✅ Dashboard works without auth:', response.status);
    console.log('Data:', response.data);
  } catch (error) {
    console.log('❌ Dashboard failed:', error.response?.status, error.response?.data);
  }
}

testDirectDashboard();