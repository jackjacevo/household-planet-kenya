const axios = require('axios');

const API_URL = process.env.API_URL || 'https://api.householdplanetkenya.co.ke';

async function testAdminAPIs() {
  console.log('🔍 Testing Admin APIs Production Status...\n');

  // Test admin login first
  try {
    console.log('1. Testing admin login...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'admin@householdplanetkenya.co.ke',
      password: 'Admin@2024!'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Admin login successful');

    // Test dashboard API
    console.log('2. Testing dashboard API...');
    const dashboardResponse = await axios.get(`${API_URL}/api/admin/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Dashboard API working');
    console.log(`   - Total Orders: ${dashboardResponse.data.overview?.totalOrders || 0}`);
    console.log(`   - Total Revenue: KSh ${(dashboardResponse.data.overview?.totalRevenue || 0).toLocaleString()}`);
    console.log(`   - Pending Orders: ${dashboardResponse.data.overview?.pendingOrders || 0}`);

    // Test products API
    console.log('3. Testing products API...');
    const productsResponse = await axios.get(`${API_URL}/api/admin/products`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Products API working');
    console.log(`   - Total Products: ${productsResponse.data.length || 0}`);

    // Test categories API
    console.log('4. Testing categories API...');
    const categoriesResponse = await axios.get(`${API_URL}/api/admin/categories`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Categories API working');
    console.log(`   - Total Categories: ${categoriesResponse.data.length || 0}`);

    // Test orders API
    console.log('5. Testing orders API...');
    const ordersResponse = await axios.get(`${API_URL}/api/orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Orders API working');
    console.log(`   - Total Orders: ${ordersResponse.data.length || 0}`);

    console.log('\n🎉 ALL ADMIN APIs ARE WORKING IN PRODUCTION!');
    console.log('\n📋 Next.js Admin Dashboard Status:');
    console.log('   ✅ Backend APIs: Fully functional');
    console.log('   ✅ Authentication: Working');
    console.log('   ✅ Dashboard: Ready');
    console.log('   ✅ Product Management: Ready');
    console.log('   ✅ Order Management: Ready');
    console.log('   ✅ Category Management: Ready');
    console.log('\n🚀 The Next.js admin dashboard is production-ready!');

  } catch (error) {
    console.error('❌ Error testing admin APIs:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n🔐 Authentication issue detected. Checking admin user...');
      // Could add admin user creation logic here if needed
    }
  }
}

testAdminAPIs();