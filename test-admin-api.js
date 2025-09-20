const axios = require('axios');

const API_URL = 'https://api.householdplanetkenya.co.ke';
const ADMIN_EMAIL = 'admin@householdplanet.co.ke';
const ADMIN_PASSWORD = 'Admin@2025';

async function testAdminAPI() {
  try {
    console.log('🔐 Testing admin login...');
    
    // Login
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    const { accessToken } = loginResponse.data;
    console.log('✅ Login successful');
    
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
    
    // Test dashboard endpoint
    console.log('📊 Testing dashboard API...');
    const dashboardResponse = await axios.get(`${API_URL}/api/admin/dashboard`, { headers });
    console.log('✅ Dashboard API working');
    
    // Test products endpoint
    console.log('🛍️ Testing products API...');
    const productsResponse = await axios.get(`${API_URL}/api/admin/products`, { headers });
    console.log(`✅ Products API working - ${productsResponse.data.products?.length || 0} products found`);
    
    // Test categories endpoint
    console.log('📂 Testing categories API...');
    const categoriesResponse = await axios.get(`${API_URL}/api/admin/categories`, { headers });
    console.log(`✅ Categories API working - ${categoriesResponse.data?.length || 0} categories found`);
    
    // Test analytics endpoints
    console.log('📈 Testing analytics APIs...');
    const salesResponse = await axios.get(`${API_URL}/api/admin/analytics/sales`, { headers });
    console.log('✅ Sales analytics working');
    
    const performanceResponse = await axios.get(`${API_URL}/api/admin/analytics/performance`, { headers });
    console.log('✅ Performance analytics working');
    
    console.log('\n🎉 All admin API endpoints are working correctly!');
    
  } catch (error) {
    console.error('❌ API Test Failed:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Message: ${error.response.data?.message || error.response.statusText}`);
      console.error(`URL: ${error.config?.url}`);
    } else {
      console.error(error.message);
    }
  }
}

testAdminAPI();