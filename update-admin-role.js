const axios = require('axios');

async function updateAdminRole() {
  try {
    console.log('🔧 Updating admin user role...');
    
    // First, try to login with the registered user
    const loginResponse = await axios.post('https://api.householdplanetkenya.co.ke/api/auth/login', {
      email: 'admin@householdplanetkenya.co.ke',
      password: 'Admin@2025'
    });
    
    console.log('✅ Login successful, user exists');
    
    // The user needs to be manually updated in the database to SUPER_ADMIN role
    console.log('⚠️ Manual step required:');
    console.log('1. Access your production database');
    console.log('2. Update the user role:');
    console.log("   UPDATE users SET role = 'SUPER_ADMIN' WHERE email = 'admin@householdplanetkenya.co.ke';");
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

updateAdminRole();