const axios = require('axios');

async function testAdminDashboard() {
  const API_URL = 'https://api.householdplanetkenya.co.ke';
  
  console.log('🔍 Testing admin dashboard access...');
  
  try {
    // First login to get a fresh token
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'admin@householdplanetkenya.co.ke',
      password: 'Admin@2025'
    });

    console.log('✅ Login successful!');
    const token = loginResponse.data.accessToken;
    console.log('User role:', loginResponse.data.user.role);

    // Now try to access admin dashboard
    const dashboardResponse = await axios.get(`${API_URL}/api/admin/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Dashboard access successful!');
    console.log('Dashboard data:', dashboardResponse.data);

  } catch (error) {
    console.error('❌ Error:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testAdminDashboard();