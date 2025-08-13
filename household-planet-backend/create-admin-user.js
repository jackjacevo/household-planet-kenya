const axios = require('axios');

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    const response = await axios.post('http://localhost:3001/auth/register', {
      email: 'admin@householdplanet.co.ke',
      password: 'AdminPass123!',
      name: 'Admin User',
      firstName: 'Admin',
      lastName: 'User',
      phone: '+254700000000'
    });
    
    console.log('✅ Admin user created successfully');
    console.log('Email: admin@householdplanet.co.ke');
    console.log('Password: Admin123!@#');
    
  } catch (error) {
    if (error.response?.status === 409) {
      console.log('✅ Admin user already exists');
    } else {
      console.error('❌ Failed to create admin user:', error.response?.data || error.message);
    }
  }
}

createAdminUser();