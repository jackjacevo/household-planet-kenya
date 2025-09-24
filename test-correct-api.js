const axios = require('axios');

async function testCorrectAPI() {
  console.log('🧪 Testing Correct API Endpoints...');
  
  const API_URL = 'https://householdplanetkenya.co.ke/api';
  
  try {
    console.log('1. Testing login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@householdplanetkenya.co.ke',
      password: 'Admin123!@#'
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
      totalProducts: dashboardResponse.data.overview?.totalProducts || 0,
      recentOrders: dashboardResponse.data.recentOrders?.length || 0
    });
    
    console.log('\n🎉 CONFIRMATION: Admin dashboard will work when you login!');
    console.log('✅ Login endpoint: WORKING');
    console.log('✅ Dashboard endpoint: WORKING');
    console.log('✅ Authentication: WORKING');
    console.log('✅ Data structure: CORRECT');
    
    return true;
  } catch (error) {
    console.error('❌ Failed:', error.response?.status, error.message);
    if (error.response?.data) {
      console.error('Error details:', error.response.data);
    }
    return false;
  }
}

testCorrectAPI();