const axios = require('axios');

async function debugUser() {
  try {
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'householdplanet819@gmail.com',
      password: 'Admin@2025'
    });
    
    console.log('Login Response User:', JSON.stringify(loginResponse.data.user, null, 2));
    
    const token = loginResponse.data.accessToken;
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    console.log('JWT Payload:', JSON.stringify(payload, null, 2));
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

debugUser();