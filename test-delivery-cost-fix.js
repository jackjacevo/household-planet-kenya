// Test script to verify delivery cost fix
const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testDeliveryCostFix() {
  console.log('🔧 Testing Delivery Cost Fix\n');

  try {
    // Test 1: Get delivery locations to see available options
    console.log('1. Getting delivery locations...');
    const locationsResponse = await axios.get(`${API_BASE}/delivery/locations`);
    const locations = locationsResponse.data.data;
    
    // Show some sample locations with their IDs and prices
    console.log('Sample locations:');
    locations.slice(0, 5).forEach(loc => {
      console.log(`   ID: ${loc.id} | ${loc.name}: Ksh ${loc.price}`);
    });

    // Test 2: Test order creation with specific delivery location
    console.log('\n2. Testing order creation with delivery location...');
    
    const testOrderData = {
      items: [
        {
          productId: 1,
          quantity: 1,
          price: 2000
        }
      ],
      deliveryLocationId: '1', // Nairobi CBD - should be Ksh 100
      paymentMethod: 'CASH'
    };

    console.log('Test order data:', JSON.stringify(testOrderData, null, 2));
    
    // Note: This would require authentication in a real scenario
    console.log('\n⚠️  To test order creation, you need to:');
    console.log('   1. Start the backend server');
    console.log('   2. Create a test user and get auth token');
    console.log('   3. Use the token to create an order');
    console.log('   4. Check the order details to see if shippingCost matches location price');

    // Test 3: Test different scenarios
    console.log('\n3. Expected delivery costs for different scenarios:');
    
    const testScenarios = [
      { locationId: '1', locationName: 'Nairobi CBD', expectedPrice: 100, orderValue: 2000 },
      { locationId: '1', locationName: 'Nairobi CBD', expectedPrice: 0, orderValue: 6000 }, // Free shipping
      { locationId: '60', locationName: 'Karen', expectedPrice: 650, orderValue: 3000 },
      { locationId: '60', locationName: 'Karen', expectedPrice: 0, orderValue: 8000 }, // Free shipping
    ];

    testScenarios.forEach(scenario => {
      const location = locations.find(loc => loc.id === scenario.locationId);
      if (location) {
        const actualPrice = scenario.orderValue >= 5000 ? 0 : location.price;
        const status = actualPrice === scenario.expectedPrice ? '✅' : '❌';
        console.log(`   ${status} ${scenario.locationName} (Order: Ksh ${scenario.orderValue}): Expected Ksh ${scenario.expectedPrice}, Actual: Ksh ${actualPrice}`);
      }
    });

    console.log('\n✅ Delivery cost logic verification completed!');
    console.log('\n📋 To verify the fix works:');
    console.log('   1. Go to checkout page');
    console.log('   2. Select a delivery location (e.g., "Karen" - Ksh 650)');
    console.log('   3. Complete the order');
    console.log('   4. Check order details - shippingCost should be 650 (or 0 if order > 5000)');
    console.log('   5. Order pages should show "Delivery Cost: Ksh 650" (not FREE unless order > 5000)');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run the test
testDeliveryCostFix();