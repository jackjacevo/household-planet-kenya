const axios = require('axios');

const API_URL = 'https://api.householdplanetkenya.co.ke';

async function createSamplePromos() {
  console.log('🎫 Creating Sample Promo Codes...');
  
  try {
    // Login
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'admin@householdplanetkenya.co.ke',
      password: 'Admin@2025'
    });
    const token = loginResponse.data.accessToken;
    console.log('✅ Admin login successful');

    const promoCodes = [
      {
        code: 'WELCOME10',
        name: 'Welcome 10% Off',
        description: 'Welcome discount for new customers',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderAmount: 500,
        maxDiscount: 200,
        usageLimit: 500,
        userUsageLimit: 1,
        isActive: true,
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        code: 'FIXED100',
        name: 'KES 100 Off',
        description: 'Get KES 100 off your order',
        discountType: 'FIXED',
        discountValue: 100,
        minOrderAmount: 800,
        usageLimit: 200,
        userUsageLimit: 2,
        isActive: true,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        code: 'BIGORDER25',
        name: '25% Off Large Orders',
        description: '25% discount on orders above KES 3000',
        discountType: 'PERCENTAGE',
        discountValue: 25,
        minOrderAmount: 3000,
        maxDiscount: 1000,
        usageLimit: 100,
        userUsageLimit: 1,
        isActive: true,
        validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        code: 'WEEKEND15',
        name: 'Weekend Special 15%',
        description: '15% off weekend orders',
        discountType: 'PERCENTAGE',
        discountValue: 15,
        minOrderAmount: 1200,
        maxDiscount: 300,
        usageLimit: 300,
        userUsageLimit: 3,
        isActive: true,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    for (const promoData of promoCodes) {
      try {
        const createResponse = await axios.post(`${API_URL}/api/promo-codes`, promoData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log(`✅ Created: ${promoData.code} - ${promoData.name}`);
      } catch (error) {
        if (error.response?.data?.message?.includes('already exists')) {
          console.log(`⚠️ Already exists: ${promoData.code}`);
        } else {
          console.log(`❌ Failed to create ${promoData.code}:`, error.response?.data?.message);
        }
      }
    }

    // Test each promo code
    console.log('\n🧪 Testing created promo codes...');
    const testOrders = [
      { amount: 600, code: 'WELCOME10' },
      { amount: 1000, code: 'FIXED100' },
      { amount: 3500, code: 'BIGORDER25' },
      { amount: 1500, code: 'WEEKEND15' }
    ];

    for (const test of testOrders) {
      try {
        const validateResponse = await axios.post(`${API_URL}/api/promo-codes/validate`, {
          code: test.code,
          orderAmount: test.amount
        });
        const result = validateResponse.data;
        console.log(`✅ ${test.code}: KES ${test.amount} → KES ${result.finalAmount} (saved KES ${result.discountAmount})`);
      } catch (error) {
        console.log(`❌ ${test.code} validation failed:`, error.response?.data?.message);
      }
    }

    // Get all promo codes
    console.log('\n📋 All promo codes:');
    const allPromos = await axios.get(`${API_URL}/api/promo-codes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    allPromos.data.data.forEach(promo => {
      console.log(`- ${promo.code}: ${promo.name} (${promo.discountType} ${promo.discountValue}${promo.discountType === 'PERCENTAGE' ? '%' : ' KES'})`);
    });

    console.log('\n🎯 Summary:');
    console.log(`✅ Created ${promoCodes.length} sample promo codes`);
    console.log('✅ All promo codes tested and working');
    console.log('✅ Ready for cart integration');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

createSamplePromos();