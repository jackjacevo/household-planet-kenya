const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testWhatsAppOrders() {
  try {
    console.log('🧪 Testing WhatsApp Orders Functionality...\n');

    // Test 1: Get pending WhatsApp messages
    console.log('1. Testing pending WhatsApp messages endpoint...');
    try {
      const response = await axios.get(`${API_BASE}/orders/whatsapp/pending`);
      console.log('✅ Pending messages endpoint works');
      console.log(`   Found ${response.data.length} pending messages`);
    } catch (error) {
      console.log('❌ Pending messages endpoint failed:', error.response?.status);
    }

    // Test 2: Get WhatsApp orders
    console.log('\n2. Testing WhatsApp orders endpoint...');
    try {
      const response = await axios.get(`${API_BASE}/orders/whatsapp/orders`);
      console.log('✅ WhatsApp orders endpoint works');
      console.log(`   Found ${response.data.length} WhatsApp orders`);
      
      if (response.data.length > 0) {
        const order = response.data[0];
        console.log(`   Latest order: ${order.orderNumber} - ${order.status} - KSh ${order.total}`);
        console.log(`   Customer: ${order.user.name} (${order.user.phone})`);
      }
    } catch (error) {
      console.log('❌ WhatsApp orders endpoint failed:', error.response?.status);
    }

    // Test 3: Get all orders with WhatsApp source filter
    console.log('\n3. Testing orders with WhatsApp source filter...');
    try {
      const response = await axios.get(`${API_BASE}/orders?source=WHATSAPP`);
      console.log('✅ Orders with source filter works');
      console.log(`   Found ${response.data.orders?.length || 0} WhatsApp orders via filter`);
    } catch (error) {
      console.log('❌ Orders with source filter failed:', error.response?.status);
    }

    // Test 4: Create a test WhatsApp order
    console.log('\n4. Testing WhatsApp order creation...');
    const testOrder = {
      customerPhone: '+254712345678',
      customerName: 'Test WhatsApp Customer',
      orderDetails: 'Test order from WhatsApp:\n- 2x Cooking Oil\n- 1x Rice 5kg',
      deliveryLocation: 'Nairobi CBD',
      deliveryCost: 200,
      estimatedTotal: 1500,
      paymentMode: 'Cash on Delivery',
      deliveryType: 'Standard',
      notes: 'Test order for WhatsApp integration'
    };

    try {
      const response = await axios.post(`${API_BASE}/orders/whatsapp`, testOrder);
      console.log('✅ WhatsApp order creation works');
      console.log(`   Created order: ${response.data.orderNumber}`);
      console.log(`   Total: KSh ${response.data.total}`);
    } catch (error) {
      console.log('❌ WhatsApp order creation failed:', error.response?.status);
      if (error.response?.data) {
        console.log('   Error:', error.response.data.message);
      }
    }

    console.log('\n🎉 WhatsApp orders test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testWhatsAppOrders();