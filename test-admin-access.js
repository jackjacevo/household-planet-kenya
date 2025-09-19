const axios = require('axios');

const API_BASE = 'https://api.householdplanetkenya.co.ke';
const ADMIN_EMAIL = 'householdplanet819@gmail.com';
const ADMIN_PASSWORD = 'Admin@2025';

async function testAdminAccess() {
  console.log('🔍 Testing admin access...\n');

  try {
    // Step 1: Register user (if not exists)
    console.log('📝 Registering user...');
    try {
      await axios.post(`${API_BASE}/api/auth/register`, {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        firstName: 'Admin',
        lastName: 'User',
        phone: '+254700000001'
      });
      console.log('✅ User registered');
    } catch (regError) {
      if (regError.response?.status === 409) {
        console.log('👤 User already exists');
      } else {
        console.log('❌ Registration error:', regError.response?.data);
      }
    }

    // Step 2: Login
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    const token = loginResponse.data.access_token;
    console.log('✅ Login successful');

    // Step 3: Get user profile
    console.log('👤 Getting user profile...');
    const profileResponse = await axios.get(`${API_BASE}/api/auth/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('📧 Email:', profileResponse.data.email);
    console.log('👑 Role:', profileResponse.data.role);
    console.log('🆔 User ID:', profileResponse.data.id);

    // Step 4: Test admin endpoints
    console.log('\n🎛️ Testing admin endpoints...');
    
    const adminEndpoints = [
      '/api/admin/dashboard',
      '/api/admin/products',
      '/api/admin/categories',
      '/api/admin/inventory/alerts'
    ];

    for (const endpoint of adminEndpoints) {
      try {
        const response = await axios.get(`${API_BASE}${endpoint}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log(`✅ ${endpoint} - Status: ${response.status}`);
      } catch (error) {
        console.log(`❌ ${endpoint} - Status: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
      }
    }

    // If user is not admin, provide manual fix
    if (profileResponse.data.role !== 'ADMIN') {
      console.log('\n🔧 USER IS NOT ADMIN - MANUAL FIX REQUIRED:');
      console.log('Run this SQL command in your database:');
      console.log(`UPDATE "User" SET role = 'ADMIN', permissions = '["ADMIN_DASHBOARD", "MANAGE_PRODUCTS", "MANAGE_ORDERS", "MANAGE_USERS", "VIEW_ANALYTICS"]' WHERE email = '${ADMIN_EMAIL}';`);
    }

  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
}

testAdminAccess().catch(console.error);