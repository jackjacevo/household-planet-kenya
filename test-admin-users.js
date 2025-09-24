const axios = require('axios');

async function testAdminUsers() {
  console.log('🔍 Testing different admin credentials...');
  
  const API_URL = 'https://householdplanetkenya.co.ke/api';
  
  const credentials = [
    { email: 'admin@householdplanetkenya.co.ke', password: 'Admin123!@#' },
    { email: 'admin@example.com', password: 'admin123' },
    { email: 'admin@admin.com', password: 'admin123' },
    { email: 'householdplanet@admin.com', password: 'admin123' },
    { email: 'admin@householdplanet.com', password: 'Admin123!@#' }
  ];
  
  for (const cred of credentials) {
    try {
      console.log(`Testing: ${cred.email}`);
      const response = await axios.post(`${API_URL}/auth/login`, cred);
      
      console.log('✅ SUCCESS! Working credentials:', cred.email);
      console.log('User role:', response.data.user?.role);
      
      // Test dashboard access
      const dashboardResponse = await axios.get(`${API_URL}/admin/dashboard`, {
        headers: { 'Authorization': `Bearer ${response.data.token}` }
      });
      
      console.log('✅ Dashboard access confirmed!');
      console.log('📊 Stats:', {
        orders: dashboardResponse.data.overview?.totalOrders || 0,
        revenue: dashboardResponse.data.overview?.totalRevenue || 0,
        customers: dashboardResponse.data.overview?.totalCustomers || 0,
        products: dashboardResponse.data.overview?.totalProducts || 0
      });
      
      return { success: true, credentials: cred };
      
    } catch (error) {
      console.log(`❌ ${cred.email}: ${error.response?.data?.error || error.message}`);
    }
  }
  
  console.log('\n💡 No working admin credentials found. You may need to:');
  console.log('1. Create an admin user in the database');
  console.log('2. Check the correct admin email/password');
  console.log('3. Reset admin password if needed');
  
  return { success: false };
}

testAdminUsers();