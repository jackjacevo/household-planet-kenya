const axios = require('axios');

async function debugLogin() {
  try {
    const response = await axios.post('https://api.householdplanetkenya.co.ke/api/auth/login', {
      email: 'householdplanet819@gmail.com',
      password: 'Admin@2025'
    });

    console.log('Full response:', JSON.stringify(response.data, null, 2));
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);

  } catch (error) {
    console.log('Error status:', error.response?.status);
    console.log('Error data:', JSON.stringify(error.response?.data, null, 2));
  }
}

debugLogin();