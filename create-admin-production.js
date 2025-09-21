const axios = require('axios');

const API_URL = process.env.API_URL || 'https://api.householdplanetkenya.co.ke';

async function createAdminUser() {
  console.log('🔧 Creating admin user for production...\n');

  try {
    // Create admin user
    const response = await axios.post(`${API_URL}/api/auth/register`, {
      name: 'Admin User',
      email: 'admin@householdplanetkenya.co.ke',
      password: 'Admin@2024!',
      role: 'ADMIN'
    });

    console.log('✅ Admin user created successfully');
    console.log('📧 Email: admin@householdplanetkenya.co.ke');
    console.log('🔑 Password: Admin@2024!');
    
    // Test login immediately
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'admin@householdplanetkenya.co.ke',
      password: 'Admin@2024!'
    });
    
    console.log('✅ Admin login test successful');
    console.log('🎉 Admin user is ready for production!');

  } catch (error) {
    if (error.response?.data?.message?.includes('already exists')) {
      console.log('ℹ️ Admin user already exists, testing login...');
      
      // Try different password combinations
      const passwords = ['Admin@2024!', 'admin123', 'password123', 'Admin123!'];
      
      for (const password of passwords) {
        try {
          const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
            email: 'admin@householdplanetkenya.co.ke',
            password: password
          });
          
          console.log(`✅ Login successful with password: ${password}`);
          console.log('🎉 Admin credentials confirmed!');
          return;
        } catch (loginError) {
          console.log(`❌ Password "${password}" failed`);
        }
      }
      
      console.log('⚠️ Could not determine admin password. Manual reset may be needed.');
    } else {
      console.error('❌ Error creating admin user:', error.response?.data || error.message);
    }
  }
}

createAdminUser();