const axios = require('axios');

async function testPromoCodesWithAuth() {
  const baseURL = 'http://localhost:3001';
  
  try {
    console.log('Testing admin login...');
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
      email: 'admin@householdplanetkenya.co.ke',
      password: 'Admin@2025'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Admin login successful');
    
    // Test promo-codes endpoint
    console.log('\nTesting promo-codes endpoint...');
    const promoResponse = await axios.get(`${baseURL}/api/promo-codes?search=`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Promo codes endpoint working!');
    console.log('Response data:', JSON.stringify(promoResponse.data, null, 2));
    
    // Test creating a promo code
    console.log('\nTesting promo code creation...');
    const createResponse = await axios.post(`${baseURL}/api/promo-codes`, {
      code: 'TEST10',
      name: 'Test 10% Off',
      description: 'Test promo code for 10% discount',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderAmount: 100,
      maxDiscount: 500,
      usageLimit: 100,
      userUsageLimit: 1,
      isActive: true,
      validFrom: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
    }, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Promo code created successfully!');
    console.log('Created promo code:', JSON.stringify(createResponse.data, null, 2));
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Error:', error.response.status, error.response.data);
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

testPromoCodesWithAuth();