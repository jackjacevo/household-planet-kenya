const axios = require('axios');

async function createTestUsers() {
  try {
    console.log('👥 Creating test users...');
    
    const users = [
      {
        email: 'john.doe@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        name: 'John Doe',
        phone: '+254712345678'
      },
      {
        email: 'jane.smith@example.com', 
        password: 'Password123!',
        firstName: 'Jane',
        lastName: 'Smith',
        name: 'Jane Smith',
        phone: '+254723456789'
      },
      {
        email: 'customer@test.com',
        password: 'Test123!',
        firstName: 'Test',
        lastName: 'Customer',
        name: 'Test Customer',
        phone: '+254700000000'
      }
    ];
    
    for (const user of users) {
      try {
        console.log(`Creating user: ${user.email}`);
        const response = await axios.post('https://api.householdplanetkenya.co.ke/api/auth/register', user);
        console.log(`✅ Created: ${user.email}`);
        
        // Test login immediately
        const loginResponse = await axios.post('https://api.householdplanetkenya.co.ke/api/auth/login', {
          email: user.email,
          password: user.password
        });
        console.log(`✅ Login test successful for: ${user.email}`);
        
      } catch (error) {
        if (error.response?.status === 409) {
          console.log(`⚠️ User ${user.email} already exists, testing login...`);
          
          // Test login for existing user
          try {
            const loginResponse = await axios.post('https://api.householdplanetkenya.co.ke/api/auth/login', {
              email: user.email,
              password: user.password
            });
            console.log(`✅ Login works for existing user: ${user.email}`);
          } catch (loginError) {
            console.log(`❌ Login failed for ${user.email}:`, loginError.response?.data?.message);
          }
        } else {
          console.log(`❌ Failed to create ${user.email}:`, error.response?.data?.message || error.message);
        }
      }
    }
    
    console.log('\n🎉 Test users setup completed!');
    console.log('\n📋 Login credentials:');
    console.log('Admin: admin@householdplanetkenya.co.ke / Admin@2025');
    console.log('Customer 1: john.doe@example.com / Password123!');
    console.log('Customer 2: jane.smith@example.com / Password123!');
    console.log('Customer 3: customer@test.com / Test123!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

createTestUsers();