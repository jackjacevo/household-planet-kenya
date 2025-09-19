const axios = require('axios');

const API_BASE = 'https://api.householdplanetkenya.co.ke';

async function createAdminUser() {
  console.log('🔧 Creating admin user...\n');

  try {
    // Try to register an admin user
    const adminData = {
      email: 'admin@householdplanetkenya.co.ke',
      password: 'Admin123!@#',
      firstName: 'Admin',
      lastName: 'User',
      phone: '+254700000000',
      role: 'ADMIN'
    };

    const response = await axios.post(`${API_BASE}/api/auth/register`, adminData);
    console.log('✅ Admin user created successfully');
    
    // Try to login
    const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      email: adminData.email,
      password: adminData.password
    });
    
    console.log('✅ Admin login successful');
    console.log('🔑 Token:', loginResponse.data.access_token.substring(0, 20) + '...');
    
    return loginResponse.data.access_token;
    
  } catch (error) {
    console.log('❌ Admin creation failed:', error.response?.data || error.message);
    
    // If user already exists, try to login
    if (error.response?.status === 409 || error.response?.data?.message?.includes('already exists')) {
      console.log('👤 User already exists, trying to login...');
      
      try {
        const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
          email: 'admin@householdplanetkenya.co.ke',
          password: 'Admin123!@#'
        });
        
        console.log('✅ Existing admin login successful');
        return loginResponse.data.access_token;
        
      } catch (loginError) {
        console.log('❌ Login failed:', loginError.response?.data || loginError.message);
      }
    }
  }
}

createAdminUser().catch(console.error);