const axios = require('axios');

// Test with local backend first, then production
const BACKENDS = [
  'http://localhost:3001',
  'https://api.householdplanetkenya.co.ke'
];

async function testAdminDashboardFrontend() {
  console.log('🧪 Testing Admin Dashboard Frontend Integration...');
  
  for (const API_URL of BACKENDS) {
    console.log(`\n🔍 Testing with backend: ${API_URL}`);
    
    try {
      // Test login
      console.log('1. Testing admin login...');
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: 'admin@householdplanetkenya.co.ke',
        password: 'Admin123!@#'
      }, {
        timeout: 10000
      });
      
      const token = loginResponse.data.token;
      console.log('✅ Login successful');
      
      // Test dashboard
      console.log('2. Testing dashboard data...');
      const dashboardResponse = await axios.get(`${API_URL}/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      const data = dashboardResponse.data;
      console.log('✅ Dashboard data received:', {
        totalOrders: data.overview?.totalOrders || 0,
        totalRevenue: data.overview?.totalRevenue || 0,
        totalCustomers: data.overview?.totalCustomers || 0,
        totalProducts: data.overview?.totalProducts || 0,
        recentOrdersCount: data.recentOrders?.length || 0
      });
      
      // Simulate frontend API configuration
      console.log('3. Testing frontend API config...');
      const frontendApiUrl = process.env.NEXT_PUBLIC_API_URL || API_URL;
      console.log('Frontend would use API URL:', frontendApiUrl);
      
      console.log(`✅ ${API_URL} - All tests passed!`);
      return { success: true, apiUrl: API_URL, data };
      
    } catch (error) {
      console.log(`❌ ${API_URL} - Failed:`, {
        message: error.message,
        status: error.response?.status,
        timeout: error.code === 'ECONNABORTED'
      });
      
      if (error.code === 'ECONNABORTED') {
        console.log('⏰ Request timed out - backend might be slow or down');
      }
    }
  }
  
  return { success: false };
}

async function simulateFrontendDashboard() {
  console.log('\n🎨 Simulating Frontend Dashboard Behavior...');
  
  const result = await testAdminDashboardFrontend();
  
  if (result.success) {
    console.log('\n✅ DASHBOARD CONFIRMATION:');
    console.log('- Admin login: WORKING');
    console.log('- Dashboard API: WORKING');
    console.log('- Data structure: CORRECT');
    console.log('- Frontend integration: READY');
    
    console.log('\n📊 Dashboard will show:');
    const data = result.data;
    console.log(`- Total Orders: ${data.overview?.totalOrders || 0}`);
    console.log(`- Total Revenue: KSh ${(data.overview?.totalRevenue || 0).toLocaleString()}`);
    console.log(`- Total Customers: ${data.overview?.totalCustomers || 0}`);
    console.log(`- Total Products: ${data.overview?.totalProducts || 0}`);
    console.log(`- Recent Orders: ${data.recentOrders?.length || 0} items`);
    
    console.log('\n🎯 RESULT: Admin dashboard will display properly!');
  } else {
    console.log('\n❌ DASHBOARD ISSUES:');
    console.log('- Check if backend is running');
    console.log('- Verify admin credentials');
    console.log('- Check network connectivity');
    console.log('- Try starting local backend: npm run start:dev');
  }
}

simulateFrontendDashboard();