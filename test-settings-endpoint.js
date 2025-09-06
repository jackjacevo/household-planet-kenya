const axios = require('axios');

async function testBackend() {
  try {
    // Test if backend is running
    console.log('Testing backend connectivity...');
    const healthCheck = await axios.get('http://localhost:3001/api');
    console.log('✅ Backend is running');
  } catch (error) {
    console.log('❌ Backend not running:', error.message);
    return;
  }

  try {
    // Test settings endpoint without auth (should get 401/403, not 404)
    console.log('Testing settings endpoint...');
    const response = await axios.get('http://localhost:3001/api/admin/settings');
    console.log('✅ Settings endpoint response:', response.status);
  } catch (error) {
    if (error.response) {
      console.log(`Settings endpoint status: ${error.response.status}`);
      if (error.response.status === 404) {
        console.log('❌ Settings endpoint not found (404)');
      } else if (error.response.status === 401 || error.response.status === 403) {
        console.log('✅ Settings endpoint exists but requires authentication');
      }
    } else {
      console.log('❌ Network error:', error.message);
    }
  }
}

testBackend();