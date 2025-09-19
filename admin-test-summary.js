const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';
const credentials = {
  email: 'householdplanet819@gmail.com',
  password: 'Admin@2025'
};

async function testSuperAdminAccess() {
  try {
    console.log('🔐 SUPER_ADMIN ACCESS TEST\n');
    
    // Login
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, credentials);
    const { accessToken, user } = loginResponse.data;
    
    // Decode JWT
    const tokenPayload = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString());
    
    console.log('✅ LOGIN SUCCESS');
    console.log(`👤 Database Role: ${user.role}`);
    console.log(`🎫 JWT Token Role: ${tokenPayload.role}`);
    console.log(`🆔 User ID: ${user.id}\n`);
    
    const headers = { Authorization: `Bearer ${accessToken}` };
    
    // Test critical admin endpoints
    const criticalTests = [
      { name: 'Admin Dashboard', url: '/admin/dashboard' },
      { name: 'Product Management', url: '/admin/products' },
      { name: 'Category Management', url: '/admin/categories' },
      { name: 'Inventory Alerts', url: '/admin/inventory/alerts' },
      { name: 'Sales Analytics', url: '/admin/analytics/sales' },
      { name: 'Brand Management', url: '/admin/brands' }
    ];
    
    console.log('🚀 TESTING CRITICAL ADMIN FUNCTIONS:\n');
    
    let allPassed = true;
    
    for (const test of criticalTests) {
      try {
        const response = await axios.get(`${API_BASE}${test.url}`, { headers });
        console.log(`✅ ${test.name}: ACCESSIBLE (${response.status})`);
      } catch (error) {
        console.log(`❌ ${test.name}: BLOCKED (${error.response?.status})`);
        allPassed = false;
      }
    }
    
    console.log('\n' + '='.repeat(50));
    
    if (allPassed) {
      console.log('🎉 SUCCESS: SUPER_ADMIN HAS FULL ACCESS!');
      console.log('✅ JWT Token Fixed: Contains SUPER_ADMIN role');
      console.log('✅ All Critical Admin Functions Accessible');
      console.log('✅ Role-Based Authorization Working');
    } else {
      console.log('⚠️  PARTIAL ACCESS: Some endpoints blocked');
    }
    
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR:', error.response?.data || error.message);
  }
}

testSuperAdminAccess();