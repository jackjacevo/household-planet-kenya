const axios = require('axios');

async function testBackend() {
  try {
    console.log('Testing backend connection...');
    const response = await axios.get('http://localhost:3001/admin/dashboard', {
      headers: {
        'Authorization': 'Bearer test-token'
      },
      timeout: 5000
    });
    console.log('Backend is running! Response:', response.status);
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Backend server is not running on port 3001');
      console.log('Please start the backend server with: npm run start:dev');
    } else if (error.response?.status === 401) {
      console.log('✅ Backend is running but authentication failed (expected)');
    } else if (error.response?.status === 404) {
      console.log('❌ Backend is running but /admin/dashboard endpoint not found');
    } else {
      console.log('Error:', error.message);
    }
  }
}

testBackend();