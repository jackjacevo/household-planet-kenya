const axios = require('axios');

async function testDeployedAdmin() {
  console.log('🧪 Testing Deployed Admin Dashboard...');
  
  try {
    // Test login
    const loginResponse = await axios.post('https://householdplanetkenya.co.ke/api/auth/login', {
      email: 'admin@householdplanetkenya.co.ke',
      password: 'Admin123!@#'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Test dashboard
    const dashboardResponse = await axios.get('https://householdplanetkenya.co.ke/api/admin/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Dashboard working:', {
      totalOrders: dashboardResponse.data.overview?.totalOrders,
      totalRevenue: dashboardResponse.data.overview?.totalRevenue,
      totalCustomers: dashboardResponse.data.overview?.totalCustomers,
      totalProducts: dashboardResponse.data.overview?.totalProducts
    });
    
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.response?.status, error.message);
    return false;
  }
}

testDeployedAdmin().then(success => {
  console.log(success ? '🎉 Admin dashboard is working!' : '💥 Admin dashboard needs fixing');
});