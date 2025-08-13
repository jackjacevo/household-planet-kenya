const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testMpesaPayment() {
  try {
    // 1. Login to get token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'john@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✓ Login successful');

    // 2. Create order with M-Pesa payment
    console.log('2. Creating order with M-Pesa payment...');
    const orderResponse = await axios.post(`${BASE_URL}/orders/with-payment`, {
      items: [
        {
          productId: 'sample-product-id',
          quantity: 1
        }
      ],
      shippingAddress: 'Nairobi, Kenya',
      deliveryLocation: 'CBD',
      deliveryPrice: 200,
      paymentMethod: 'MPESA',
      phoneNumber: '254712345678'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✓ Order created with payment:', orderResponse.data);

    // 3. Check payment status
    if (orderResponse.data.payment?.checkoutRequestId) {
      console.log('3. Checking payment status...');
      const statusResponse = await axios.get(
        `${BASE_URL}/payments/status/${orderResponse.data.payment.checkoutRequestId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('✓ Payment status:', statusResponse.data);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testMpesaPayment();