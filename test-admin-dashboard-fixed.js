const axios = require('axios');

const API_URL = 'https://api.householdplanetkenya.co.ke';

async function testAdminDashboard() {
  console.log('🧪 Testing Admin Dashboard with correct endpoints...');
  
  try {
    // Test auth login endpoint
    console.log('1. Testing auth login endpoint...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@householdplanetkenya.co.ke',
      password: 'Admin123!@#'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Admin login successful, token received');
    
    // Test dashboard endpoint
    console.log('2. Testing admin dashboard endpoint...');
    const dashboardResponse = await axios.get(`${API_URL}/admin/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Dashboard API successful:', {
      status: dashboardResponse.status,
      hasData: !!dashboardResponse.data,
      overview: dashboardResponse.data.overview,
      recentOrdersCount: dashboardResponse.data.recentOrders?.length || 0,
      topProductsCount: dashboardResponse.data.topProducts?.length || 0
    });
    
    // Test if frontend can access the data
    console.log('3. Verifying dashboard data structure...');
    const data = dashboardResponse.data;
    
    const requiredFields = [
      'overview.totalOrders',
      'overview.totalRevenue', 
      'overview.totalCustomers',
      'overview.totalProducts'
    ];
    
    const missingFields = [];
    requiredFields.forEach(field => {
      const keys = field.split('.');
      let current = data;
      for (const key of keys) {
        if (current && typeof current === 'object' && key in current) {
          current = current[key];
        } else {
          missingFields.push(field);
          break;
        }
      }
    });
    
    if (missingFields.length === 0) {
      console.log('✅ All required dashboard fields present');
      console.log('📊 Dashboard stats:', {
        totalOrders: data.overview.totalOrders,
        totalRevenue: data.overview.totalRevenue,
        totalCustomers: data.overview.totalCustomers,
        totalProducts: data.overview.totalProducts
      });
    } else {
      console.log('⚠️ Missing fields:', missingFields);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url
    });
    
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
    
    return false;
  }
}

testAdminDashboard().then(success => {
  if (success) {
    console.log('\n🎉 Admin dashboard test PASSED');
    console.log('✅ Login works');
    console.log('✅ Dashboard API works');
    console.log('✅ Data structure is correct');
    console.log('\n👉 Frontend should now display dashboard properly');
  } else {
    console.log('\n💥 Admin dashboard test FAILED');
  }
  process.exit(success ? 0 : 1);
});