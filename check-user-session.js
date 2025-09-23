const axios = require('axios');

async function checkUserSession() {
  try {
    const loginResponse = await axios.post('https://api.householdplanetkenya.co.ke/api/auth/login', {
      email: 'householdplanet819@gmail.com',
      password: 'Admin@2025'
    });
    
    console.log('Login response:', JSON.stringify(loginResponse.data, null, 2));
    
    const token = loginResponse.data.access_token;
    
    // Decode JWT payload (just for debugging)
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    console.log('JWT payload:', payload);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

checkUserSession();