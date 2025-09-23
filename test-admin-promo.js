const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function testAdminPromo() {
  console.log('🔐 Testing Admin Promo Code Management...\n');

  // First, let's get an admin token (you'll need to replace with actual admin credentials)
  console.log('1. Getting admin token...');
  try {
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@householdplanetkenya.co.ke', // Replace with your admin email
      password: 'Admin@123' // Replace with your admin password
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Admin logged in successfully\n');

    // Test 2: Get existing promo codes
    console.log('2. Fetching existing promo codes...');
    const promoResponse = await axios.get(`${API_URL}/promo-codes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ Found ${promoResponse.data.data.length} existing promo codes:`);
    promoResponse.data.data.forEach(code => {
      console.log(`   - ${code.code}: ${code.name} (${code.discountType === 'PERCENTAGE' ? code.discountValue + '%' : 'KSh ' + code.discountValue})`);
    });

    // Test 3: Create a new promo code
    console.log('\n3. Creating new promo code "NEWUSER50"...');
    const newPromo = await axios.post(`${API_URL}/promo-codes`, {
      code: 'NEWUSER50',
      name: '50% New User Discount',
      description: 'Special 50% discount for new users',
      discountType: 'PERCENTAGE',
      discountValue: 50,
      minOrderAmount: 1000,
      maxDiscount: 1000,
      usageLimit: 100,
      userUsageLimit: 1,
      isActive: true,
      validFrom: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ New promo code created:', newPromo.data.code);

    // Test 4: Validate the new promo code
    console.log('\n4. Testing the new promo code with order amount 2000...');
    const validateResponse = await axios.post(`${API_URL}/promo-codes/validate`, {
      code: 'NEWUSER50',
      orderAmount: 2000
    });

    console.log('✅ NEWUSER50 Validation:');
    console.log(`   - Original Amount: KSh 2000`);
    console.log(`   - Discount: KSh ${validateResponse.data.discountAmount}`);
    console.log(`   - Final Amount: KSh ${validateResponse.data.finalAmount}`);
    console.log(`   - Max Discount Applied: ${validateResponse.data.discountAmount >= 1000 ? 'Yes' : 'No'}`);

    console.log('\n🎉 Complete flow working perfectly!');
    console.log('\n✅ Process Summary:');
    console.log('   1. Admin creates promo code in dashboard');
    console.log('   2. Customer enters code in cart');
    console.log('   3. System validates and applies discount');
    console.log('   4. Customer proceeds to checkout with discounted amount');

  } catch (error) {
    if (error.response?.status === 401) {
      console.log('❌ Admin login failed. Please check credentials in the script.');
      console.log('   You can test the public validation endpoint without login.');
    } else {
      console.log('❌ Error:', error.response?.data?.message || error.message);
    }
  }
}

testAdminPromo();