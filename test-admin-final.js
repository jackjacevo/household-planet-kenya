const axios = require('axios');

async function testAdminDashboard() {
  console.log('🧪 Testing Admin Dashboard with provided credentials...');
  
  const API_URL = 'https://householdplanetkenya.co.ke/api';
  
  try {
    console.log('1. Testing login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'householdplanet819@gmail.com',
      password: 'Admin@2025'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    console.log('2. Testing dashboard...');
    const dashboardResponse = await axios.get(`${API_URL}/admin/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Dashboard API working!');
    console.log('📊 Dashboard data:', {
      totalOrders: dashboardResponse.data.overview?.totalOrders || 0,
      totalRevenue: dashboardResponse.data.overview?.totalRevenue || 0,
      totalCustomers: dashboardResponse.data.overview?.totalCustomers || 0,
      totalProducts: dashboardResponse.data.overview?.totalProducts || 0
    });
    
    console.log('\n🎉 CONFIRMED: Admin dashboard will work when you login!');
    console.log('✅ Use: householdplanet819@gmail.com / Admin@2025');
    console.log('✅ Go to: https://householdplanetkenya.co.ke/admin/login');
    console.log('✅ Click "Admin Dashboard" after login');
    
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.response?.status, error.message);
    return false;
  }
}

testAdminDashboard();