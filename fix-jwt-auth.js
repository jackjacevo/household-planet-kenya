const axios = require('axios');

async function fixJwtAuth() {
  try {
    const loginResponse = await axios.post('https://api.householdplanetkenya.co.ke/api/auth/login', {
      email: 'householdplanet819@gmail.com',
      password: 'Admin@2025'
    });

    const token = loginResponse.data.access_token;
    console.log('Token received:', token ? 'YES' : 'NO');
    
    // Test profile endpoint
    try {
      const profileResponse = await axios.get('https://api.householdplanetkenya.co.ke/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Profile works - Role:', profileResponse.data.role);
    } catch (error) {
      console.log('❌ Profile failed:', error.response?.status, error.response?.data);
    }

    // Test simple admin endpoint
    try {
      const dashResponse = await axios.get('https://api.householdplanetkenya.co.ke/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Dashboard works');
    } catch (error) {
      console.log('❌ Dashboard failed:', error.response?.status, error.response?.data);
    }

  } catch (error) {
    console.log('❌ Login failed:', error.response?.data);
  }
}

fixJwtAuth();