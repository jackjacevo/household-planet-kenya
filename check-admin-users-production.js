const axios = require('axios');

const API_URL = process.env.API_URL || 'https://api.householdplanetkenya.co.ke';

async function checkAdminUsers() {
  console.log('🔍 Checking existing admin users...\n');

  // Try common admin credentials
  const adminCredentials = [
    { email: 'admin@householdplanetkenya.co.ke', password: 'Admin@2024!' },
    { email: 'admin@householdplanetkenya.co.ke', password: 'admin123' },
    { email: 'admin@householdplanetkenya.co.ke', password: 'password123' },
    { email: 'admin@householdplanetkenya.co.ke', password: 'Admin123!' },
    { email: 'householdplanet@admin.com', password: 'Admin@2024!' },
    { email: 'householdplanet@admin.com', password: 'admin123' },
  ];

  for (const creds of adminCredentials) {
    try {
      console.log(`Testing: ${creds.email} with password: ${creds.password}`);
      const response = await axios.post(`${API_URL}/api/auth/login`, creds);
      
      console.log('✅ FOUND WORKING ADMIN CREDENTIALS!');
      console.log(`📧 Email: ${creds.email}`);
      console.log(`🔑 Password: ${creds.password}`);
      console.log(`🎫 Token: ${response.data.access_token.substring(0, 20)}...`);
      
      // Test admin dashboard access
      const dashboardResponse = await axios.get(`${API_URL}/api/admin/dashboard`, {
        headers: { 'Authorization': `Bearer ${response.data.access_token}` }
      });
      
      console.log('✅ Admin dashboard access confirmed');
      console.log('🎉 Next.js Admin is ready for production!');
      
      return;
    } catch (error) {
      console.log(`❌ Failed: ${error.response?.data?.message || error.message}`);
    }
  }

  console.log('\n⚠️ No working admin credentials found.');
  console.log('💡 You may need to create an admin user directly in the database.');
}

checkAdminUsers();