const axios = require('axios');

async function testAdminAPI() {
  try {
    console.log('Testing admin dashboard API...');
    
    // Test if backend is running
    const healthCheck = await axios.get('http://localhost:3001/api/admin/dashboard', {
      timeout: 5000,
      headers: {
        'Authorization': 'Bearer test-token' // This will fail auth but should return 401, not 404
      }
    }).catch(error => {
      console.log('Response status:', error.response?.status);
      console.log('Response data:', error.response?.data);
      return error.response;
    });

    if (healthCheck?.status === 401) {
      console.log('✅ Backend is running - got 401 Unauthorized (expected without valid token)');
      console.log('❌ Issue: Frontend needs valid authentication token');
    } else if (healthCheck?.status === 404) {
      console.log('❌ Backend endpoint not found - check if admin routes are properly configured');
    } else {
      console.log('Backend response:', healthCheck?.status, healthCheck?.data);
    }

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Backend server is not running on http://localhost:3001');
      console.log('💡 Solution: Start the backend server with: cd household-planet-backend && npm run start:dev');
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

testAdminAPI();