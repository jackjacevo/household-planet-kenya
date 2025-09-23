const axios = require('axios');

const API_URL = 'https://api.householdplanetkenya.co.ke';
const ADMIN_EMAIL = 'admin@householdplanetkenya.co.ke';
const ADMIN_PASSWORD = 'Admin@2025';

async function testAdminDashboardAccess() {
  try {
    console.log('🔐 Testing admin login...');
    
    // Step 1: Login
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    const { accessToken, user } = loginResponse.data;
    console.log(`✅ Login successful - Role: ${user.role}`);
    
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
      console.log('❌ User role is not admin. Current role:', user.role);
      console.log('⚠️ Need to update role in database to SUPER_ADMIN');
      return;
    }
    
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
    
    // Step 2: Test dashboard access
    console.log('📊 Testing dashboard access...');
    const dashboardResponse = await axios.get(`${API_URL}/api/admin/dashboard`, { headers });
    console.log('✅ Dashboard access successful');
    console.log('Dashboard data:', JSON.stringify(dashboardResponse.data, null, 2));
    
    // Step 3: Test other admin endpoints
    console.log('🛍️ Testing products endpoint...');
    const productsResponse = await axios.get(`${API_URL}/api/admin/products`, { headers });
    console.log(`✅ Products endpoint working - Found ${productsResponse.data.products?.length || 0} products`);
    
    console.log('📂 Testing categories endpoint...');
    const categoriesResponse = await axios.get(`${API_URL}/api/admin/categories`, { headers });
    console.log(`✅ Categories endpoint working - Found ${categoriesResponse.data?.length || 0} categories`);
    
    console.log('\n🎉 Admin dashboard access is fully functional!');
    console.log('✅ You can access the admin dashboard at: https://householdplanetkenya.co.ke/admin');
    
  } catch (error) {
    console.error('❌ Test Failed:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Message: ${error.response.data?.message || error.response.statusText}`);
      console.error(`URL: ${error.config?.url}`);
      
      if (error.response.status === 401) {
        console.log('💡 Solution: Check admin credentials');
      } else if (error.response.status === 403) {
        console.log('💡 Solution: Update user role to SUPER_ADMIN in database');
        console.log('   SQL: UPDATE users SET role = \'SUPER_ADMIN\' WHERE email = \'admin@householdplanetkenya.co.ke\';');
      }
    } else {
      console.error(error.message);
    }
  }
}

testAdminDashboardAccess();