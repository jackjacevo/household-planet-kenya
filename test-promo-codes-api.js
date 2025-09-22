const axios = require('axios');

const API_URL = 'https://api.householdplanetkenya.co.ke';

async function testPromoCodesAPI() {
  console.log('🎫 Testing Promo Codes API...');
  
  try {
    // Login
    console.log('\n🔐 Logging in...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'admin@householdplanet.co.ke',
      password: 'Admin@2025'
    });
    const token = loginResponse.data.accessToken;
    console.log('✅ Admin login successful');

    // Test promo codes endpoints
    console.log('\n📋 Testing promo codes GET...');
    try {
      const promoResponse = await axios.get(`${API_URL}/api/admin/promo-codes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Promo codes GET successful:', promoResponse.data.length || 0, 'codes');
    } catch (error) {
      console.log('❌ Promo codes GET failed:', error.response?.status, error.response?.data?.message);
    }

    // Create sample promo code
    console.log('\n🎫 Creating sample promo code...');
    const promoData = {
      code: 'SAVE20',
      description: 'Save 20% on your order',
      type: 'PERCENTAGE',
      value: 20,
      minimumAmount: 1000,
      maximumDiscount: 500,
      usageLimit: 100,
      isActive: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    };

    try {
      const createResponse = await axios.post(`${API_URL}/api/admin/promo-codes`, promoData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Promo code created:', createResponse.data.code || 'SAVE20');
    } catch (error) {
      console.log('❌ Promo code creation failed:', error.response?.status, error.response?.data?.message);
    }

    // Test promo code validation (cart usage)
    console.log('\n🛒 Testing promo code validation...');
    try {
      const validateResponse = await axios.post(`${API_URL}/api/admin/promo-codes/validate`, {
        code: 'SAVE20',
        orderAmount: 2000
      });
      console.log('✅ Promo code validation successful:', validateResponse.data);
    } catch (error) {
      console.log('❌ Promo code validation failed:', error.response?.status, error.response?.data?.message);
    }

    // Test different promo code types
    console.log('\n💰 Creating fixed amount promo code...');
    const fixedPromoData = {
      code: 'FIXED100',
      description: 'Get KES 100 off',
      type: 'FIXED',
      value: 100,
      minimumAmount: 500,
      usageLimit: 50,
      isActive: true,
      expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
    };

    try {
      await axios.post(`${API_URL}/api/admin/promo-codes`, fixedPromoData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Fixed amount promo code created: FIXED100');
    } catch (error) {
      console.log('❌ Fixed promo creation failed:', error.response?.data?.message);
    }

    console.log('\n🎯 Summary:');
    console.log('- Admin promo codes API tested');
    console.log('- Sample promo codes created');
    console.log('- Cart validation tested');
    console.log('- Ready for frontend integration');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testPromoCodesAPI();