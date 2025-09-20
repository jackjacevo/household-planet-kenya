const axios = require('axios');

async function createAdmin() {
  try {
    console.log('👤 Creating admin user via registration...');
    
    // Try to register admin user
    const response = await axios.post('https://api.householdplanetkenya.co.ke/api/auth/register', {
      email: 'admin@householdplanet.co.ke',
      password: 'Admin@2025',
      firstName: 'Admin',
      lastName: 'User',
      phone: '+254700000000'
    });
    
    console.log('✅ Admin user registered successfully');
    console.log('Note: You need to manually update the role to SUPER_ADMIN in the database');
    
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message === 'User already exists') {
      console.log('ℹ️ Admin user already exists, testing login...');
      
      // Test login
      try {
        const loginResponse = await axios.post('https://api.householdplanetkenya.co.ke/api/auth/login', {
          email: 'admin@householdplanet.co.ke',
          password: 'Admin@2025'
        });
        console.log('✅ Admin login successful');
      } catch (loginError) {
        console.log('❌ Admin login failed - role might not be set correctly');
      }
    } else {
      console.error('❌ Failed to create admin user:', error.response?.data || error.message);
    }
  }
}

createAdmin();