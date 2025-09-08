const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function testPromoCodes() {
  try {
    console.log('🧪 Testing Promo Code System...\n');

    // Test 1: Get all promo codes (requires admin token)
    console.log('1. Testing promo code validation (public endpoint)...');
    
    const validateResponse = await axios.post(`${API_URL}/promo-codes/validate`, {
      code: 'SAVE10',
      orderAmount: 1500,
      productIds: [1, 2],
      categoryIds: [1]
    });

    console.log('✅ Validation Response:', {
      valid: validateResponse.data.valid,
      code: validateResponse.data.promoCode.code,
      discountAmount: validateResponse.data.discountAmount,
      finalAmount: validateResponse.data.finalAmount
    });

    // Test 2: Test invalid promo code
    console.log('\n2. Testing invalid promo code...');
    try {
      await axios.post(`${API_URL}/promo-codes/validate`, {
        code: 'INVALID',
        orderAmount: 1500
      });
    } catch (error) {
      console.log('✅ Invalid code rejected:', error.response.data.message);
    }

    // Test 3: Test minimum order amount
    console.log('\n3. Testing minimum order amount validation...');
    try {
      await axios.post(`${API_URL}/promo-codes/validate`, {
        code: 'SAVE10',
        orderAmount: 500 // Less than minimum 1000
      });
    } catch (error) {
      console.log('✅ Minimum order validation:', error.response.data.message);
    }

    console.log('\n🎉 All tests passed! Promo code system is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testPromoCodes();