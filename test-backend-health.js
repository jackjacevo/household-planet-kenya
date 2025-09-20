const axios = require('axios');

async function testBackendHealth() {
  const endpoints = [
    'https://api.householdplanetkenya.co.ke/health',
    'https://api.householdplanetkenya.co.ke/api/health',
    'https://api.householdplanetkenya.co.ke'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`🔍 Testing: ${endpoint}`);
      const response = await axios.get(endpoint, { timeout: 10000 });
      console.log(`✅ ${endpoint} - Status: ${response.status}`);
      console.log(`Response:`, response.data);
    } catch (error) {
      console.log(`❌ ${endpoint} - Error: ${error.response?.status || error.code} ${error.response?.statusText || error.message}`);
    }
  }
}

testBackendHealth();