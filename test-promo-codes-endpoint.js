const axios = require('axios');

async function testPromoCodesEndpoint() {
  const baseURL = 'http://localhost:3001';
  
  console.log('Testing backend connectivity...');
  
  try {
    // Test if backend is running
    const healthCheck = await axios.get(`${baseURL}/api`);
    console.log('✅ Backend is running');
  } catch (error) {
    console.log('❌ Backend is not running or not accessible');
    console.log('Error:', error.message);
    return;
  }
  
  try {
    // Test promo-codes endpoint without auth (should get 401)
    const response = await axios.get(`${baseURL}/api/promo-codes`);
    console.log('❌ Unexpected: Got response without auth:', response.status);
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✅ Promo codes endpoint exists (requires auth as expected)');
    } else if (error.response && error.response.status === 404) {
      console.log('❌ Promo codes endpoint not found (404)');
      console.log('Response:', error.response.data);
    } else {
      console.log('❌ Unexpected error:', error.message);
    }
  }
  
  // Test with a simple admin login to get token
  try {
    console.log('\nTesting with admin credentials...');
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
      email: 'admin@householdplanetkenya.co.ke',
      password: 'Admin123!@#'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Admin login successful');
    
    // Now test promo-codes with auth
    const promoResponse = await axios.get(`${baseURL}/api/promo-codes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Promo codes endpoint working!');
    console.log('Response:', promoResponse.data);
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Auth test failed:', error.response.status, error.response.data);
    } else {
      console.log('❌ Auth test error:', error.message);
    }
  }
}

testPromoCodesEndpoint();