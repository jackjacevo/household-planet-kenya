const axios = require('axios');

async function debugReceiptIssue() {
  try {
    // First, let's try to login as admin to get a valid token
    console.log('Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@householdplanetkenya.co.ke',
      password: 'HouseholdAdmin2024!'
    });
    
    const token = loginResponse.data.token;
    console.log('Login successful, got token');
    
    // Now get orders
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
    console.log(`\nTesting receipt generation for order ${firstOrder.id} (${firstOrder.orderNumber})`);
    console.log('Order details:', {
      id: firstOrder.id,
      orderNumber: firstOrder.orderNumber,
      status: firstOrder.status,
      paymentStatus: firstOrder.paymentStatus,
      total: firstOrder.total,
      subtotal: firstOrder.subtotal,
      shippingCost: firstOrder.shippingCost,
      deliveryPrice: firstOrder.deliveryPrice
    });
    
    // Check if order has payment transactions
    console.log('\nChecking payment transactions...');
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
    console.log('Receipt data keys:', Object.keys(receiptResponse.data));
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    
    if (error.response?.status === 500) {
      console.error('Server error details:', error.response.data);
      console.error('Full error response:', error.response);
    }
    
    if (error.response?.status === 401) {
      console.error('Authentication failed. Check admin credentials.');
    }
  }
}

debugReceiptIssue();