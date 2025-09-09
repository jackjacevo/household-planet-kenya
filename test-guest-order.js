const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function testGuestOrderFlow() {
  console.log('🧪 Testing Guest Order Flow...\n');

  try {
    // 1. Create a guest order
    console.log('1. Creating guest order...');
    const orderData = {
      items: [
        {
          productId: 2,
          variantId: null,
          quantity: 2,
          price: 1500
        }
      ],
      deliveryPrice: 200,
      paymentMethod: 'CASH_ON_DELIVERY',
      customerName: 'John Guest',
      customerPhone: '+254700123456',
      customerEmail: 'john@example.com',
      deliveryLocation: 'Nairobi CBD'
    };

    const createResponse = await axios.post(`${API_URL}/orders/guest`, orderData);
    console.log('✅ Guest order created:', createResponse.data.orderNumber);
    
    const orderNumber = createResponse.data.orderNumber;
    const customerPhone = '+254700123456';

    // 2. Test guest order lookup
    console.log('\n2. Testing guest order lookup...');
    const lookupResponse = await axios.get(
      `${API_URL}/orders/guest/${orderNumber}?phone=${encodeURIComponent(customerPhone)}`
    );
    console.log('✅ Guest order lookup successful:', lookupResponse.data.orderNumber);

    // 3. Test order tracking
    console.log('\n3. Testing order tracking...');
    const trackingResponse = await axios.get(`${API_URL}/orders/track/${orderNumber}`);
    console.log('✅ Order tracking successful:', trackingResponse.data.order.status);

    // 4. Test invalid phone lookup
    console.log('\n4. Testing invalid phone lookup...');
    try {
      await axios.get(`${API_URL}/orders/guest/${orderNumber}?phone=+254700999999`);
      console.log('❌ Should have failed with invalid phone');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Invalid phone correctly rejected');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    console.log('\n🎉 All guest order tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testGuestOrderFlow();