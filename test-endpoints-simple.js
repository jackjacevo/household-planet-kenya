const axios = require('axios');

async function testEndpoints() {
  const API_URL = 'https://api.householdplanetkenya.co.ke';
  
  const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
    email: 'admin@householdplanet.co.ke',
    password: 'Admin@2025'
  });
  const token = loginResponse.data.accessToken;

  const tests = [
    { url: '/api/admin/dashboard', name: 'Dashboard' },
    { url: '/api/admin/stats', name: 'Stats' },
    { url: '/api/admin/analytics', name: 'Analytics' },
    { url: '/api/dashboard', name: 'Public Dashboard' }
  ];

  for (const test of tests) {
    try {
      await axios.get(`${API_URL}${test.url}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ ${test.name}: WORKING`);
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.response?.status || 'ERROR'}`);
    }
  }
}

testEndpoints();