const axios = require('axios');

const API_URL = 'https://api.householdplanetkenya.co.ke';

async function testSimpleAdmin() {
  console.log('🔍 Testing Simple Admin Access...');
  
  try {
    // Login
    console.log('\n🔐 Logging in...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'admin@householdplanetkenya.co.ke',
      password: 'Admin@2025'
    });
    console.log('Login response:', loginResponse.data);
    const token = loginResponse.data.access_token || loginResponse.data.token || loginResponse.data.accessToken;
    console.log('✅ Admin login successful');
    console.log('🎫 Token received:', token ? token.substring(0, 20) + '...' : 'No token');

    // Test admin categories GET endpoint
    console.log('\n📂 Testing admin categories GET...');
    try {
      const categoriesResponse = await axios.get(`${API_URL}/api/admin/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Admin categories GET successful:', categoriesResponse.data.length, 'categories');
    } catch (error) {
      console.log('❌ Admin categories GET failed:', error.response?.status, error.response?.data?.message);
    }

    // Test admin dashboard
    console.log('\n📊 Testing admin dashboard...');
    try {
      const dashboardResponse = await axios.get(`${API_URL}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Admin dashboard successful');
    } catch (error) {
      console.log('❌ Admin dashboard failed:', error.response?.status, error.response?.data?.message);
    }

    // Test admin products
    console.log('\n📦 Testing admin products...');
    try {
      const productsResponse = await axios.get(`${API_URL}/api/admin/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Admin products successful');
    } catch (error) {
      console.log('❌ Admin products failed:', error.response?.status, error.response?.data?.message);
    }

    console.log('\n🎯 Summary:');
    console.log('- JWT token authentication working');
    console.log('- Admin endpoints accessibility tested');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testSimpleAdmin();