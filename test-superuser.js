const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';
const credentials = {
  email: 'householdplanet819@gmail.com',
  password: 'Admin@2025'
};

async function testSuperuser() {
  try {
    console.log('🔐 Testing Superuser Login...');
    
    // Login
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, credentials);
    const { accessToken, user } = loginResponse.data;
    
    console.log('✅ Login successful');
    console.log('👤 User Role:', user.role);
    console.log('🎫 Token received');
    
    // Decode JWT to check role
    try {
      const tokenPayload = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString());
      console.log('🔍 JWT Role:', tokenPayload.role);
      console.log('🔍 JWT User ID:', tokenPayload.sub);
    } catch (e) {
      console.log('❌ Failed to decode JWT');
    }
    
    const headers = { Authorization: `Bearer ${accessToken}` };
    
    // Test admin endpoints
    const endpoints = [
      { name: 'Dashboard', url: '/admin/dashboard' },
      { name: 'Inventory Alerts', url: '/admin/inventory/alerts' },
      { name: 'Products', url: '/admin/products' },
      { name: 'Categories', url: '/admin/categories' }
    ];
    
    console.log('\n📊 Testing Admin Endpoints:');
    
    for (const endpoint of endpoints) {
      try {
        await axios.get(`${API_BASE}${endpoint.url}`, { headers });
        console.log(`✅ ${endpoint.name}: Working`);
      } catch (error) {
        console.log(`❌ ${endpoint.name}: ${error.response?.status} ${error.response?.statusText}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testSuperuser();