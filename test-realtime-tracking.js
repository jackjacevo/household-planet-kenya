const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function testRealtimeTracking() {
  console.log('🧪 Testing Real-time Order Tracking Updates...\n');

  try {
    // 1. First, let's get a list of orders to work with
    console.log('📋 Fetching existing orders...');
    const ordersResponse = await axios.get(`${API_BASE}/admin/orders`, {
      headers: {
        'Authorization': 'Bearer admin-token' // You may need to adjust this
      }
    });

    if (!ordersResponse.data.orders || ordersResponse.data.orders.length === 0) {
      console.log('❌ No orders found to test with');
      return;
    }

    const testOrder = ordersResponse.data.orders[0];
    console.log(`✅ Found test order: ${testOrder.orderNumber} (ID: ${testOrder.id})`);
    console.log(`   Current status: ${testOrder.status}`);
    console.log(`   Tracking number: ${testOrder.trackingNumber || 'None'}\n`);

    // 2. Test order status update
    console.log('🔄 Testing order status update...');
    const newStatus = testOrder.status === 'PENDING' ? 'CONFIRMED' : 'PROCESSING';
    
    const updateResponse = await axios.patch(`${API_BASE}/admin/orders/${testOrder.id}/status`, {
      status: newStatus,
      notes: 'Real-time test update'
    }, {
      headers: {
        'Authorization': 'Bearer admin-token'
      }
    });

    console.log(`✅ Order status updated to: ${newStatus}`);
    console.log('📡 Real-time notification should be sent via WebSocket');

    // 3. Test tracking endpoint
    if (testOrder.trackingNumber) {
      console.log('\n🔍 Testing tracking endpoint...');
      const trackingResponse = await axios.get(`${API_BASE}/delivery/tracking/${testOrder.trackingNumber}`);
      console.log(`✅ Tracking data retrieved for: ${testOrder.trackingNumber}`);
      console.log(`   Status: ${trackingResponse.data.status}`);
    }

    console.log('\n✅ Real-time tracking test completed!');
    console.log('\n📝 To verify real-time updates:');
    console.log('1. Open the frontend order tracking page');
    console.log('2. Update order status from admin panel');
    console.log('3. Watch for instant updates without page refresh');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testRealtimeTracking();