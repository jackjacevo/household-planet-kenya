const axios = require('axios');

const API_BASE = 'https://api.householdplanetkenya.co.ke';

async function fixAdminAccess() {
  console.log('🔧 Fixing admin access issues...\n');

  // Test different approaches to fix the 403 errors
  
  console.log('1. Testing backend health...');
  try {
    const health = await axios.get(`${API_BASE}/api/health`);
    console.log('✅ Backend is healthy:', health.status);
  } catch (error) {
    console.log('❌ Backend health failed:', error.message);
    return;
  }

  console.log('\n2. Testing login with different credentials...');
  
  // Try to find any working admin credentials
  const testCredentials = [
    { email: 'householdplanet819@gmail.com', password: 'Admin@2025' },
    { email: 'admin@householdplanetkenya.co.ke', password: 'Admin@2025' },
    { email: 'admin@admin.com', password: 'admin123' }
  ];

  let workingToken = null;
  
  for (const creds of testCredentials) {
    try {
      console.log(`Testing: ${creds.email}`);
      const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, creds);
      
      if (loginResponse.data.access_token) {
        console.log(`✅ Login successful for ${creds.email}`);
        workingToken = loginResponse.data.access_token;
        
        // Test profile access
        try {
          const profileResponse = await axios.get(`${API_BASE}/api/auth/profile`, {
            headers: { 'Authorization': `Bearer ${workingToken}` }
          });
          console.log(`👤 Profile accessible - Role: ${profileResponse.data.role}`);
          
          // Test admin dashboard
          try {
            const dashboardResponse = await axios.get(`${API_BASE}/api/admin/dashboard`, {
              headers: { 'Authorization': `Bearer ${workingToken}` }
            });
            console.log('✅ Admin dashboard accessible!');
            console.log('🎉 ADMIN ACCESS WORKING!');
            
            console.log('\n🔑 WORKING CREDENTIALS:');
            console.log('Email:', creds.email);
            console.log('Password:', creds.password);
            console.log('Token:', workingToken.substring(0, 30) + '...');
            
            return;
            
          } catch (dashError) {
            console.log(`❌ Dashboard failed: ${dashError.response?.status} - ${dashError.response?.data?.message}`);
          }
          
        } catch (profileError) {
          console.log(`❌ Profile failed: ${profileError.response?.status} - ${profileError.response?.data?.message}`);
        }
        
        break;
      }
    } catch (error) {
      console.log(`❌ Login failed for ${creds.email}: ${error.response?.data?.message || error.message}`);
    }
  }

  if (!workingToken) {
    console.log('\n💡 SOLUTION STEPS:');
    console.log('1. Go to your frontend application');
    console.log('2. Register with: householdplanet819@gmail.com / Admin@2025');
    console.log('3. Then run this SQL command in your database:');
    console.log(`   UPDATE "User" SET role = 'ADMIN', permissions = '["ADMIN_DASHBOARD", "MANAGE_PRODUCTS", "MANAGE_ORDERS", "MANAGE_USERS", "VIEW_ANALYTICS"]', "emailVerified" = true WHERE email = 'householdplanet819@gmail.com';`);
    console.log('4. Clear browser cache and login again');
  }
}

fixAdminAccess().catch(console.error);