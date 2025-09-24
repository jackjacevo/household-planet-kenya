const axios = require('axios');

const API_URL = process.env.API_URL || 'https://api.householdplanetkenya.co.ke';

async function testAdminDashboardAPI() {
  console.log('🧪 Testing Admin Dashboard API...');
  
  try {
    // First, login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@householdplanetkenya.co.ke',
      password: 'Admin123!@#'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Admin login successful');
    
    // Test dashboard endpoint
    console.log('2. Testing dashboard endpoint...');
    const dashboardResponse = await axios.get(`${API_URL}/admin/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Dashboard API response:', {
      status: dashboardResponse.status,
      hasOverview: !!dashboardResponse.data.overview,
      hasRecentOrders: !!dashboardResponse.data.recentOrders,
      hasTopProducts: !!dashboardResponse.data.topProducts,
      totalOrders: dashboardResponse.data.overview?.totalOrders,
      totalRevenue: dashboardResponse.data.overview?.totalRevenue,
      totalCustomers: dashboardResponse.data.overview?.totalCustomers,
      totalProducts: dashboardResponse.data.overview?.totalProducts
    });
    
    // Test individual endpoints that dashboard might use
    console.log('3. Testing individual endpoints...');
    
    const endpoints = [
      '/admin/orders/stats',
      '/admin/products/stats', 
      '/admin/customers/stats'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${API_URL}${endpoint}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log(`✅ ${endpoint}: ${response.status}`);
      } catch (error) {
        console.log(`❌ ${endpoint}: ${error.response?.status || 'Failed'}`);
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Dashboard API test failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return false;
  }
}

testAdminDashboardAPI().then(success => {
  console.log(success ? '🎉 Dashboard API test completed successfully' : '💥 Dashboard API test failed');
  process.exit(success ? 0 : 1);
});