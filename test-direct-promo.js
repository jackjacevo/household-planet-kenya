const axios = require('axios');

const API_URL = 'https://api.householdplanetkenya.co.ke';

async function testDirectPromo() {
  console.log('🎫 Testing Direct Promo Codes API...');
  
  try {
    // Login
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'admin@householdplanet.co.ke',
      password: 'Admin@2025'
    });
    const token = loginResponse.data.accessToken;
    console.log('✅ Admin login successful');

    // Test direct promo codes endpoints
    console.log('\n📋 Testing direct promo codes GET...');
    try {
      const promoResponse = await axios.get(`${API_URL}/api/promo-codes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Direct promo codes GET successful:', promoResponse.data);
    } catch (error) {
      console.log('❌ Direct promo codes GET failed:', error.response?.status, error.response?.data?.message);
    }

    // Create sample promo code directly
    console.log('\n🎫 Creating sample promo code directly...');
    const promoData = {
      code: 'SAVE20',
      name: 'Save 20% Discount',
      description: 'Save 20% on your order',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      minOrderAmount: 1000,
      maxDiscount: 500,
      usageLimit: 100,
      isActive: true,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    try {
      const createResponse = await axios.post(`${API_URL}/api/promo-codes`, promoData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Promo code created directly:', createResponse.data);
    } catch (error) {
      console.log('❌ Direct promo code creation failed:', error.response?.status, error.response?.data?.message);
    }

    // Test validation directly
    console.log('\n🛒 Testing direct promo code validation...');
    try {
      const validateResponse = await axios.post(`${API_URL}/api/promo-codes/validate`, {
        code: 'SAVE20',
        orderAmount: 2000
      });
      console.log('✅ Direct promo code validation successful:', validateResponse.data);
    } catch (error) {
      console.log('❌ Direct promo code validation failed:', error.response?.status, error.response?.data?.message);
    }

    console.log('\n🎯 Direct API Summary:');
    console.log('- Direct promo codes endpoints tested');
    console.log('- Sample promo code creation attempted');
    console.log('- Direct validation tested');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testDirectPromo();