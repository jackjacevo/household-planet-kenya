const axios = require('axios');

async function testReceiptGeneration() {
  try {
    // First, let's get a list of orders to find one that might have payment issues
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiYWRtaW5AaG91c2Vob2xkcGxhbmV0LmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTczNzU0NzE5NCwiZXhwIjoxNzM4MTUxOTk0fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'; // Replace with actual admin token
    
    console.log('Fetching orders...');
    const ordersResponse = await axios.get('http://localhost:3001/api/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const orders = ordersResponse.data.orders || ordersResponse.data;
    console.log(`Found ${orders.length} orders`);
    
    if (orders.length === 0) {
      console.log('No orders found');
      return;
    }
    
    // Try to generate receipt for the first order
    const firstOrder = orders[0];
    console.log(`Testing receipt generation for order ${firstOrder.id} (${firstOrder.orderNumber})`);
    console.log('Order details:', {
      id: firstOrder.id,
      orderNumber: firstOrder.orderNumber,
      status: firstOrder.status,
      paymentStatus: firstOrder.paymentStatus,
      total: firstOrder.total,
      subtotal: firstOrder.subtotal,
      shippingCost: firstOrder.shippingCost
    });
    
    // Check payment status first
    console.log('\nChecking payment status...');
    try {
      const paymentStatusResponse = await axios.get(`http://localhost:3001/api/payments/status/${firstOrder.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Payment status:', paymentStatusResponse.data);
    } catch (paymentError) {
      console.log('Payment status error:', paymentError.response?.data || paymentError.message);
    }
    
    // Try to generate receipt
    console.log('\nTrying to generate receipt...');
    const receiptResponse = await axios.get(`http://localhost:3001/api/payments/receipt/${firstOrder.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('Receipt generated successfully!');
    console.log('Receipt data:', JSON.stringify(receiptResponse.data, null, 2));
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    
    if (error.response?.status === 500) {
      console.error('Server error details:', error.response.data);
    }
  }
}

testReceiptGeneration();