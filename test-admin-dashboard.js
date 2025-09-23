const axios = require('axios');

const API_URL = 'https://api.householdplanetkenya.co.ke';

async function testAdminDashboard() {
  console.log('📊 Testing Admin Dashboard API...');
  
  try {
    // Login
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'admin@householdplanetkenya.co.ke',
      password: 'Admin@2025'
    });
    const token = loginResponse.data.accessToken;
    console.log('✅ Login successful');

    // Test admin dashboard endpoint
    console.log('\n📊 Testing /api/admin/dashboard...');
    try {
      const dashboardResponse = await axios.get(`${API_URL}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Admin dashboard working:', Object.keys(dashboardResponse.data));
    } catch (error) {
      console.log('❌ Admin dashboard failed:', error.response?.status, error.response?.data?.message);
    }

    // Test alternative endpoints
    console.log('\n🔍 Testing alternative endpoints...');
    
    const endpoints = [
      '/api/dashboard',
      '/api/admin/stats',
      '/api/admin/analytics'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${API_URL}${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ ${endpoint} working`);
      } catch (error) {
        console.log(`❌ ${endpoint} failed:`, error.response?.status);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAdminDashboard();