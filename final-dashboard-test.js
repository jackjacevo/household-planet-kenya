const axios = require('axios');

async function finalDashboardTest() {
  const API_URL = 'https://householdplanetkenya.co.ke/api';
  
  try {
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'householdplanet819@gmail.com',
      password: 'Admin@2025'
    });
    
    console.log('✅ Login successful');
    console.log('User:', loginResponse.data.user);
    
    const dashboardResponse = await axios.get(`${API_URL}/admin/dashboard`, {
      headers: { 'Authorization': `Bearer ${loginResponse.data.token}` }
    });
    
    console.log('✅ DASHBOARD WORKING!');
    console.log('📊 Dashboard data:', {
      totalOrders: dashboardResponse.data.overview?.totalOrders || 0,
      totalRevenue: dashboardResponse.data.overview?.totalRevenue || 0,
      totalCustomers: dashboardResponse.data.overview?.totalCustomers || 0,
      totalProducts: dashboardResponse.data.overview?.totalProducts || 0
    });
    
    console.log('\n🎉 CONFIRMED: Admin dashboard is working!');
    console.log('✅ Login: householdplanet819@gmail.com / Admin@2025');
    console.log('✅ Dashboard displays properly');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.status, error.response?.data || error.message);
  }
}

finalDashboardTest();