const axios = require('axios');

async function seedProduction() {
  try {
    console.log('🌱 Seeding production database...');
    
    // Create admin user via setup endpoint
    const response = await axios.post('https://api.householdplanetkenya.co.ke/api/setup/admin', {
      email: 'admin@householdplanetkenya.co.ke',
      password: 'Admin@2025',
      firstName: 'Admin',
      lastName: 'User'
    });
    
    console.log('✅ Admin user created successfully');
    console.log('📧 Email: admin@householdplanetkenya.co.ke');
    console.log('🔑 Password: Admin@2025');
    
  } catch (error) {
    if (error.response?.status === 409) {
      console.log('ℹ️ Admin user already exists');
    } else {
      console.error('❌ Failed to create admin user:', error.response?.data || error.message);
    }
  }
}

seedProduction();