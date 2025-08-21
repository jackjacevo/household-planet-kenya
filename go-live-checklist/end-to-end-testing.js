// End-to-End Order Testing Script
const axios = require('axios');

const API_BASE = process.env.API_URL || 'https://api.householdplanet.co.ke';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://householdplanet.co.ke';

async function testCompleteOrderFlow() {
  console.log('🔄 Testing Complete Order Flow...');
  
  let authToken, orderId, customerId;

  // Step 1: Customer Registration
  try {
    const registerResponse = await axios.post(`${API_BASE}/api/auth/register`, {
      name: 'Test Customer',
      email: 'testcustomer@example.com',
      password: 'Test123!@#',
      phone: '+254700000000',
      address: 'Test Address, Nairobi'
    });
    
    authToken = registerResponse.data.token;
    customerId = registerResponse.data.user.id;
    console.log('✅ Customer Registration: Success');
  } catch (error) {
    console.log('❌ Customer Registration: Failed', error.message);
    return;
  }

  // Step 2: Browse Products
  try {
    const productsResponse = await axios.get(`${API_BASE}/api/products?limit=5`);
    console.log(`✅ Product Browsing: ${productsResponse.data.products.length} products loaded`);
  } catch (error) {
    console.log('❌ Product Browsing: Failed', error.message);
  }

  // Step 3: Add to Cart
  try {
    const cartResponse = await axios.post(`${API_BASE}/api/cart/add`, {
      productId: 1,
      quantity: 2
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Add to Cart: Success');
  } catch (error) {
    console.log('❌ Add to Cart: Failed', error.message);
  }

  // Step 4: Get Cart
  try {
    const getCartResponse = await axios.get(`${API_BASE}/api/cart`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`✅ Get Cart: ${getCartResponse.data.items.length} items`);
  } catch (error) {
    console.log('❌ Get Cart: Failed', error.message);
  }

  // Step 5: Calculate Delivery
  try {
    const deliveryResponse = await axios.post(`${API_BASE}/api/delivery/calculate`, {
      destination: 'Nairobi CBD',
      items: 2,
      weight: 1.5
    });
    console.log(`✅ Delivery Calculation: KES ${deliveryResponse.data.fee}`);
  } catch (error) {
    console.log('❌ Delivery Calculation: Failed', error.message);
  }

  // Step 6: Create Order
  try {
    const orderResponse = await axios.post(`${API_BASE}/api/orders`, {
      deliveryAddress: 'Test Address, Nairobi CBD',
      deliveryLocation: 'Nairobi CBD',
      paymentMethod: 'mpesa',
      phone: '+254700000000'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    orderId = orderResponse.data.order.id;
    console.log(`✅ Order Creation: Order ${orderId} created`);
  } catch (error) {
    console.log('❌ Order Creation: Failed', error.message);
  }

  // Step 7: Process Payment
  try {
    const paymentResponse = await axios.post(`${API_BASE}/api/payments/mpesa/stk-push`, {
      orderId: orderId,
      phoneNumber: '+254700000000',
      amount: 2500
    });
    console.log('✅ Payment Processing: STK Push initiated');
  } catch (error) {
    console.log('❌ Payment Processing: Failed', error.message);
  }

  // Step 8: Check Order Status
  try {
    const statusResponse = await axios.get(`${API_BASE}/api/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`✅ Order Status: ${statusResponse.data.status}`);
  } catch (error) {
    console.log('❌ Order Status: Failed', error.message);
  }

  console.log('🎉 End-to-End Test Completed');
}

async function testGuestCheckout() {
  console.log('🔄 Testing Guest Checkout...');
  
  try {
    const guestOrderResponse = await axios.post(`${API_BASE}/api/orders/guest`, {
      customerInfo: {
        name: 'Guest Customer',
        email: 'guest@example.com',
        phone: '+254700000001',
        address: 'Guest Address, Nairobi'
      },
      items: [
        { productId: 1, quantity: 1, price: 1500 }
      ],
      deliveryLocation: 'Nairobi CBD',
      paymentMethod: 'mpesa'
    });
    
    console.log(`✅ Guest Checkout: Order ${guestOrderResponse.data.order.id} created`);
  } catch (error) {
    console.log('❌ Guest Checkout: Failed', error.message);
  }
}

testCompleteOrderFlow();
testGuestCheckout();