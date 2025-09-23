const axios = require('axios');

async function testNewAdmin() {
  try {
    const response = await axios.post('https://api.householdplanetkenya.co.ke/api/auth/login', {
      email: 'admin@householdplanetkenya.co.ke',
      password: 'Admin@2025'
    });

    console.log('✅ Login successful');
    console.log('👤 Role:', response.data.user.role);
    console.log('🔑 Token:', response.data.accessToken ? 'YES' : 'NO');

    const token = response.data.accessToken;
    
    // Test dashboard
    const dashResponse = await axios.get('https://api.householdplanetkenya.co.ke/api/admin/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Dashboard works:', dashResponse.status);
    console.log('📊 Data:', dashResponse.data);

  } catch (error) {
    console.log('❌ Error:', error.response?.status, error.response?.data?.message);
  }
}

testNewAdmin();