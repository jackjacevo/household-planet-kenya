const axios = require('axios');

async function testAuth() {
  const API_URL = 'http://localhost:3001';
  
  console.log('🔍 Testing authentication...');
  
  try {
    // Test login with test credentials
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Login successful!');
    console.log('Response:', {
      user: loginResponse.data.user,
      hasToken: !!loginResponse.data.accessToken
    });

    // Test profile endpoint with token
    const token = loginResponse.data.accessToken;
    const profileResponse = await axios.get(`${API_URL}/api/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Profile fetch successful!');
    console.log('Profile:', profileResponse.data.user);

  } catch (error) {
    console.error('❌ Authentication test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testAuth();