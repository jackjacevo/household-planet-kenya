const axios = require('axios');

async function testApiRevenueEndpoint() {
  try {
    console.log('🔍 Testing API revenue analytics endpoint...');
    
    // First, let's test if the backend is running
    const healthResponse = await axios.get('https://api.householdplanetkenya.co.ke/api/health');
    console.log('✅ Backend is running:', healthResponse.data);
    
    // Test the revenue endpoint without auth first
    try {
      const revenueResponse = await axios.get('https://api.householdplanetkenya.co.ke/api/admin/analytics/revenue?period=monthly');
      console.log('✅ Revenue endpoint response:', revenueResponse.data);
    } catch (error) {
      console.log('❌ Revenue endpoint error:', error.response?.status, error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        console.log('🔐 Endpoint requires authentication, testing with admin login...');
        
        // Try to login as admin first
        try {
          const loginResponse = await axios.post('https://api.householdplanetkenya.co.ke/api/auth/login', {
            email: 'admin@householdplanetkenya.co.ke',
            password: 'HouseholdPlanet2024!'
          });
          
          const token = loginResponse.data.access_token;
          console.log('✅ Admin login successful');
          
          // Now test with auth
          const authenticatedResponse = await axios.get('https://api.householdplanetkenya.co.ke/api/admin/analytics/revenue?period=monthly', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          console.log('✅ Authenticated revenue endpoint response:', authenticatedResponse.data);
        } catch (loginError) {
          console.log('❌ Admin login failed:', loginError.response?.data || loginError.message);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testApiRevenueEndpoint();