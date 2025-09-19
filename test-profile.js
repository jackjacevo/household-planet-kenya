const axios = require('axios');

async function testProfile() {
  try {
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'householdplanet819@gmail.com',
      password: 'Admin@2025'
    });
    
    const token = loginResponse.data.accessToken;
    
    const profileResponse = await axios.get('http://localhost:3001/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Profile Response:', JSON.stringify(profileResponse.data, null, 2));
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testProfile();