const axios = require('axios');

async function updateAdminRole() {
  try {
    console.log('🔧 Updating admin role via temporary endpoint...');
    
    const response = await axios.post('https://api.householdplanetkenya.co.ke/api/temp/update-admin-role', {
      email: 'admin@householdplanet.co.ke',
      secretKey: 'temp-update-admin-2025'
    });
    
    console.log('✅ Role updated successfully!');
    console.log('Response:', response.data);
    
    // Test admin access
    console.log('🔐 Testing admin access...');
    const loginResponse = await axios.post('https://api.householdplanetkenya.co.ke/api/auth/login', {
      email: 'admin@householdplanet.co.ke',
      password: 'Admin@2025'
    });
    
    console.log(`✅ Admin login successful - Role: ${loginResponse.data.user.role}`);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

updateAdminRole();