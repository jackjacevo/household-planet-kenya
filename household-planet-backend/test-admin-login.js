const axios = require('axios');

async function testAdminLogin() {
  const API_URL = 'http://localhost:3001';
  
  console.log('🔍 Testing admin login...');
  
  try {
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'admin@householdplanetkenya.co.ke',
      password: 'Admin@2025'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Admin login successful!');
    console.log('User:', loginResponse.data.user);

  } catch (error) {
    console.error('❌ Admin login failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testAdminLogin();