const axios = require('axios');

async function testAdminEndpoints() {
  try {
    console.log('🔍 Testing various admin endpoints...');
    
    // Test endpoints without auth first
    const endpoints = [
      '/admin/dashboard',
      '/admin/analytics/revenue?period=monthly',
      '/admin/analytics/sales?period=monthly',
      '/admin/products',
      '/admin/categories'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`https://api.householdplanetkenya.co.ke${endpoint}`);
        console.log(`✅ ${endpoint}: ${response.status}`);
      } catch (error) {
        console.log(`❌ ${endpoint}: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
      }
    }
    
    // Now test with authentication
    console.log('\n🔐 Testing with admin authentication...');
    
    try {
      const loginResponse = await axios.post('https://api.householdplanetkenya.co.ke/auth/login', {
        email: 'admin@householdplanetkenya.co.ke',
        password: 'HouseholdPlanet2024!'
      });
      
      const token = loginResponse.data.access_token;
      console.log('✅ Admin login successful');
      
      // Test with auth
      for (const endpoint of endpoints) {
        try {
          const response = await axios.get(`https://api.householdplanetkenya.co.ke${endpoint}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          console.log(`✅ ${endpoint} (authenticated): ${response.status}`);
        } catch (error) {
          console.log(`❌ ${endpoint} (authenticated): ${error.response?.status} - ${error.response?.data?.message || error.message}`);
        }
      }
      
    } catch (loginError) {
      console.log('❌ Admin login failed:', loginError.response?.data || loginError.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAdminEndpoints();