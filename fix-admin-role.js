const axios = require('axios');

async function fixAdminRole() {
  try {
    console.log('🔧 Fixing admin role using setup endpoint...');
    
    const response = await axios.post('https://api.householdplanetkenya.co.ke/api/setup/admin', {
      secret: 'household-planet-setup-2025'
    });
    
    console.log('✅ Admin role updated successfully!');
    console.log('Response:', response.data);
    
    // Test admin access
    console.log('🔐 Testing admin access...');
    const loginResponse = await axios.post('https://api.householdplanetkenya.co.ke/api/auth/login', {
      email: 'admin@householdplanetkenya.co.ke',
      password: 'Admin@2025'
    });
    
    console.log(`✅ Admin login successful - Role: ${loginResponse.data.user.role}`);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

fixAdminRole();