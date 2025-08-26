const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function debugAdminAuth() {
  try {
    console.log('🔍 Debugging admin authentication...');
    
    // Test login first
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'admin@householdplanet.co.ke',
      password: 'HouseholdAdmin2024!'
    });
    
    console.log('✅ Login successful');
    console.log('📄 Full response:', JSON.stringify(loginResponse.data, null, 2));
    
    const token = loginResponse.data.accessToken || loginResponse.data.access_token || loginResponse.data.token;
    const user = loginResponse.data.user;
    
    if (!token) {
      console.log('❌ No token found in response');
      return;
    }
    
    console.log('👤 User:', JSON.stringify(user, null, 2));
    console.log('🔑 Token length:', token.length);
    console.log('🔑 Token starts with:', token.substring(0, 20) + '...');
    
    // Test token validation
    const headers = { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('\n📡 Testing admin endpoints...');
    
    // Test dashboard endpoint
    try {
      const dashboardResponse = await axios.get(`${API_URL}/api/admin/dashboard`, { headers });
      console.log('✅ Dashboard endpoint accessible');
    } catch (error) {
      console.log('❌ Dashboard endpoint failed:', error.response?.status, error.response?.data?.message);
    }
    
    // Test products endpoint
    try {
      const productsResponse = await axios.get(`${API_URL}/api/admin/products`, { headers });
      console.log('✅ Products endpoint accessible');
      console.log('📦 Products count:', productsResponse.data.data?.length || 0);
    } catch (error) {
      console.log('❌ Products endpoint failed:', error.response?.status, error.response?.data?.message);
      console.log('❌ Full error:', error.response?.data);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data || error.message);
  }
}

debugAdminAuth();