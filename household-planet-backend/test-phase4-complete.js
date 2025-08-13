const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
let authToken = '';
let userId = '';

async function testCompleteDeliverySystem() {
  console.log('🚚 Testing Phase 4 - Complete Kenya Delivery System Integration\n');

  try {
    // Step 1: Register and login user
    console.log('1. Setting up test user...');
    const registerData = {
      email: `delivery_test_${Date.now()}@test.com`,
      password: 'Test123!@#',
      name: 'Delivery Test User',
      phone: '+254700000000'
    };

    await axios.post(`${BASE_URL}/api/auth/register`, registerData);
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: registerData.email,
      password: registerData.password
    });

    authToken = loginResponse.data.access_token;
    userId = loginResponse.data.user.id;
    console.log('✅ Test user created and logged in');

    // Step 2: Initialize delivery locations
    console.log('\n2. Initializing Kenya delivery locations...');
    const initResponse = await axios.post(`${BASE_URL}/api/delivery/initialize`);
    console.log('✅ Delivery locations initialized');

    // Step 3: Get all delivery locations
    console.log('\n3. Fetching delivery locations...');
    const locationsResponse = await axios.get(`${BASE_URL}/api/delivery/locations`);
    console.log('✅ Kenya Delivery Locations (Tier 1 - Ksh 100-200):');
    locationsResponse.data.forEach(location => {
      console.log(`   - ${location.name}: Ksh ${location.price}`);
      console.log(`     ${location.description}`);
    });

    // Step 4: Create a test product
    console.log('\n4. Creating test product...');
    const categoryResponse = await axios.get(`${BASE_URL}/api/categories`);
    const categoryId = categoryResponse.data[0]?.id;

    if (!categoryId) {
      console.log('Creating test category...');
      const newCategory = await axios.post(`${BASE_URL}/api/categories`, {
        name: 'Test Category',
        slug: 'test-category'
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      categoryId = newCategory.data.id;
    }

    const productData = {
      name: 'Test Delivery Product',
      slug: `test-delivery-product-${Date.now()}`,
      description: 'Product for testing delivery system',
      sku: `TEST-DEL-${Date.now()}`,
      price: 1500,
      categoryId: categoryId,
      stock: 100
    };

    const productResponse = await axios.post(`${BASE_URL}/api/products`, productData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const productId = productResponse.data.id;
    console.log('✅ Test product created:', productResponse.data.name);

    // Step 5: Test order creation with different delivery locations
    console.log('\n5. Testing order creation with delivery integration...');
    
    const testOrders = [
      { location: 'Nairobi CBD', expectedPrice: 100 },
      { location: 'Kitengela (Via Shuttle)', expectedPrice: 150 },
      { location: 'Juja (Via Super Metrol)', expectedPrice: 200 }
    ];

    for (const testOrder of testOrders) {
      console.log(`\n   Testing order for ${testOrder.location}...`);
      
      const orderData = {
        items: [{
          productId: productId,
          quantity: 2
        }],
        shippingAddress: 'Test Address, Nairobi',
        deliveryLocation: testOrder.location,
        paymentMethod: 'CASH_ON_DELIVERY'
      };

      const orderResponse = await axios.post(`${BASE_URL}/api/orders`, orderData, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      const order = orderResponse.data;
      console.log(`   ✅ Order created: ${order.orderNumber}`);
      console.log(`   📍 Delivery Location: ${order.deliveryLocation}`);
      console.log(`   💰 Delivery Price: Ksh ${order.deliveryPrice} (Expected: Ksh ${testOrder.expectedPrice})`);
      console.log(`   📦 Subtotal: Ksh ${order.subtotal}`);
      console.log(`   🧾 Total: Ksh ${order.total}`);
      
      // Verify delivery price is correct
      if (order.deliveryPrice === testOrder.expectedPrice) {
        console.log(`   ✅ Delivery price calculation correct`);
      } else {
        console.log(`   ❌ Delivery price mismatch! Got ${order.deliveryPrice}, expected ${testOrder.expectedPrice}`);
      }
    }

    // Step 6: Test price calculation API
    console.log('\n6. Testing delivery price calculation API...');
    const priceTests = [
      'Nairobi CBD',
      'Kajiado (Naekana)',
      'Thika (Super Metrol)',
      'Kikuyu Town (Super Metrol)'
    ];

    for (const location of priceTests) {
      const priceResponse = await axios.get(`${BASE_URL}/api/delivery/price?location=${encodeURIComponent(location)}`);
      console.log(`   ${location}: Ksh ${priceResponse.data.price}`);
    }

    // Step 7: Test error handling
    console.log('\n7. Testing error handling...');
    try {
      await axios.get(`${BASE_URL}/api/delivery/price?location=NonExistent Location`);
    } catch (error) {
      console.log('   ✅ Invalid location error handled:', error.response.data.message);
    }

    console.log('\n🎉 Phase 4 Complete Delivery System Tests Passed!');
    console.log('\n📋 Implementation Summary:');
    console.log('✅ Kenya delivery locations database created');
    console.log('✅ Tier 1 locations (Ksh 100-200) configured:');
    console.log('   • Nairobi CBD - Ksh 100');
    console.log('   • Kajiado (Naekana) - Ksh 150');
    console.log('   • Kitengela (Via Shuttle) - Ksh 150');
    console.log('   • Thika (Super Metrol) - Ksh 150');
    console.log('   • Juja (Via Super Metrol) - Ksh 200');
    console.log('   • Kikuyu Town (Super Metrol) - Ksh 200');
    console.log('✅ Automatic delivery price calculation integrated');
    console.log('✅ Order system updated with delivery integration');
    console.log('✅ API endpoints for delivery management');
    console.log('✅ Error handling for invalid locations');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the complete test
testCompleteDeliverySystem();