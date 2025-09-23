const axios = require('axios');

async function debugPromoCodesAuth() {
  const baseURL = 'http://localhost:3001';
  
  try {
    console.log('Testing admin login...');
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
      email: 'admin@householdplanetkenya.co.ke',
      password: 'Admin@2025'
    });
    
    console.log('✅ Admin login successful');
    console.log('Login response:', JSON.stringify(loginResponse.data, null, 2));
    
    const token = loginResponse.data.accessToken;
    console.log('Token:', token);
    
    // Test promo-codes endpoint with detailed debugging
    console.log('\nTesting promo-codes endpoint...');
    try {
      const promoResponse = await axios.get(`${baseURL}/api/promo-codes?search=`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Promo codes endpoint working!');
      console.log('Response:', JSON.stringify(promoResponse.data, null, 2));
      
    } catch (promoError) {
      console.log('❌ Promo codes endpoint failed');
      if (promoError.response) {
        console.log('Status:', promoError.response.status);
        console.log('Headers:', promoError.response.headers);
        console.log('Data:', promoError.response.data);
      } else {
        console.log('Error:', promoError.message);
      }
      
      // Try a different admin endpoint to see if it's a general auth issue
      console.log('\nTesting other admin endpoints...');
      try {
        const categoriesResponse = await axios.get(`${baseURL}/api/admin/categories`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Admin categories endpoint working');
      } catch (catError) {
        console.log('❌ Admin categories also failing:', catError.response?.status, catError.response?.data);
      }
    }
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Error:', error.response.status, error.response.data);
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

debugPromoCodesAuth();