const axios = require('axios');

async function checkUserRole() {
  const API_URL = 'https://householdplanetkenya.co.ke/api';
  
  try {
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'householdplanet819@gmail.com',
      password: 'Admin@2025'
    });
    
    console.log('✅ Login successful');
    console.log('User data:', loginResponse.data.user);
    console.log('Role:', loginResponse.data.user?.role);
    
    if (loginResponse.data.user?.role !== 'ADMIN') {
      console.log('❌ User role is not ADMIN - dashboard access denied');
      console.log('💡 Need to update user role to ADMIN in database');
    } else {
      console.log('✅ User has ADMIN role');
    }
    
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
}

checkUserRole();