const axios = require('axios');

const API_URL = 'http://localhost:3001/api';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoiYWRtaW5AaG91c2Vob2xkcGxhbmV0LmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTczNjYyNzI5MywiZXhwIjoxNzM3MjMyMDkzfQ.Qs8Qs_Qs8Qs_Qs8Qs_Qs8Qs_Qs8Qs_Qs8Qs_Qs8Qs'; // Replace with valid admin token

async function testDeliveryFlow() {
  try {
    console.log('🧪 Testing Delivery Cost Flow...\n');

    // Step 1: Get delivery locations
    console.log('1️⃣ Getting delivery locations...');
    const locationsResponse = await axios.get(`${API_URL}/delivery/locations`);
    const locations = locationsResponse.data;
    console.log(`Found ${locations.length} delivery locations`);
    
    if (locations.length === 0) {
      console.log('❌ No delivery locations found');
      return;
    }

    const testLocation = locations[0];
    console.log(`Using test location: ${testLocation.name} - KSh ${testLocation.price}\n`);

    // Step 2: Create a test order with delivery cost
    console.log('2️⃣ Creating test order...');
    const orderData = {
      items: [
        {
          productId: 1,
          quantity: 1,
          price: 1500
        }
      ],
      deliveryLocationId: testLocation.id,
      deliveryLocation: testLocation.name,
      deliveryPrice: testLocation.price,
      paymentMethod: 'CASH_ON_DELIVERY',
      customerName: 'Test Customer',
      customerPhone: '+254700000000',
      customerEmail: 'test@example.com'
    };

    console.log('Order data:', JSON.stringify(orderData, null, 2));

    const orderResponse = await axios.post(`${API_URL}/orders/guest`, orderData, {
      headers: { 'Content-Type': 'application/json' }
    });

    const order = orderResponse.data;
    console.log(`✅ Order created: ${order.orderNumber}`);
    console.log(`   Subtotal: KSh ${order.subtotal}`);
    console.log(`   Delivery Cost: KSh ${order.deliveryPrice || order.shippingCost || 0}`);
    console.log(`   Total: KSh ${order.total}\n`);

    // Step 3: Fetch order details to verify delivery cost is stored
    console.log('3️⃣ Fetching order details...');
    const orderDetailsResponse = await axios.get(`${API_URL}/orders/${order.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const orderDetails = orderDetailsResponse.data;
    console.log(`✅ Order details retrieved:`);
    console.log(`   Order Number: ${orderDetails.orderNumber}`);
    console.log(`   Delivery Location: ${orderDetails.deliveryLocation}`);
    console.log(`   Delivery Price: KSh ${orderDetails.deliveryPrice || 0}`);
    console.log(`   Shipping Cost: KSh ${orderDetails.shippingCost || 0}`);
    console.log(`   Total: KSh ${orderDetails.total}\n`);

    // Step 4: Test guest order lookup (receipt view)
    console.log('4️⃣ Testing guest order lookup (receipt view)...');
    const guestOrderResponse = await axios.post(`${API_URL}/orders/guest-lookup`, {
      orderNumber: order.orderNumber,
      phone: '+254700000000'
    });

    const guestOrder = guestOrderResponse.data;
    console.log(`✅ Guest order lookup successful:`);
    console.log(`   Order Number: ${guestOrder.orderNumber}`);
    console.log(`   Delivery Location: ${guestOrder.deliveryLocation}`);
    console.log(`   Shipping Cost: KSh ${guestOrder.shippingCost || 0}`);
    console.log(`   Total: KSh ${guestOrder.total}\n`);

    // Step 5: Verify delivery cost consistency
    console.log('5️⃣ Verifying delivery cost consistency...');
    const expectedDeliveryCost = testLocation.price;
    const orderDeliveryCost = orderDetails.deliveryPrice || orderDetails.shippingCost || 0;
    const receiptDeliveryCost = guestOrder.shippingCost || 0;

    console.log(`Expected: KSh ${expectedDeliveryCost}`);
    console.log(`Order Details: KSh ${orderDeliveryCost}`);
    console.log(`Receipt View: KSh ${receiptDeliveryCost}`);

    if (orderDeliveryCost === expectedDeliveryCost && receiptDeliveryCost === expectedDeliveryCost) {
      console.log('✅ SUCCESS: Delivery cost is consistent across all views!');
    } else {
      console.log('❌ FAILURE: Delivery cost inconsistency detected!');
      console.log(`   Expected: ${expectedDeliveryCost}`);
      console.log(`   Order: ${orderDeliveryCost}`);
      console.log(`   Receipt: ${receiptDeliveryCost}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the test
testDeliveryFlow();