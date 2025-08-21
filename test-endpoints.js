const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Test endpoints
const endpoints = [
  '/admin/dashboard',
  '/admin/activities/stats',
  '/orders/admin/stats',
  '/payments/admin/stats'
];

async function testEndpoints() {
  console.log('Testing backend endpoints...\n');
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': 'Bearer test-token' // This will fail auth but should not return 404
        }
      });
      console.log(`✅ ${endpoint}: ${response.status}`);
    } catch (error) {
      if (error.response) {
        console.log(`${error.response.status === 404 ? '❌' : '⚠️'} ${endpoint}: ${error.response.status} - ${error.response.statusText}`);
      } else {
        console.log(`❌ ${endpoint}: ${error.message}`);
      }
    }
  }
}

testEndpoints();