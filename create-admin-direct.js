const axios = require('axios');

const API_BASE = 'https://api.householdplanetkenya.co.ke';

async function createAdminDirect() {
  console.log('🔧 Creating admin user with proper validation...\n');

  try {
    const adminData = {
      email: 'admin@householdplanetkenya.co.ke',
      password: 'AdminSecure123!@#$',
      firstName: 'Admin',
      lastName: 'User',
      phone: '+254700000000'
    };

    console.log('📝 Registering admin user...');
    const response = await axios.post(`${API_BASE}/api/auth/register`, adminData);
    console.log('✅ Admin user registered successfully');
    
    // Login to get token
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      email: adminData.email,
      password: adminData.password
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Login successful');
    
    // Test admin dashboard access
    console.log('🎛️ Testing admin dashboard access...');
    const dashboardResponse = await axios.get(`${API_BASE}/api/admin/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Admin dashboard accessible');
    console.log('📊 Dashboard data:', Object.keys(dashboardResponse.data));
    
    // Save credentials for frontend
    console.log('\n🔑 ADMIN CREDENTIALS:');
    console.log('Email:', adminData.email);
    console.log('Password:', adminData.password);
    console.log('Token:', token.substring(0, 30) + '...');
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
    
    if (error.response?.status === 409) {
      console.log('\n👤 User already exists. Trying different approach...');
      
      // Try to login with existing user
      try {
        const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
          email: 'admin@householdplanetkenya.co.ke',
          password: 'AdminSecure123!@#$'
        });
        
        console.log('✅ Login with existing user successful');
        console.log('🔑 Token:', loginResponse.data.access_token.substring(0, 30) + '...');
        
      } catch (loginError) {
        console.log('❌ Login failed:', loginError.response?.data || loginError.message);
        console.log('\n💡 Try these solutions:');
        console.log('1. Reset admin password in database');
        console.log('2. Check if user role is set to ADMIN');
        console.log('3. Verify JWT_SECRET in environment');
      }
    }
  }
}

createAdminDirect().catch(console.error);