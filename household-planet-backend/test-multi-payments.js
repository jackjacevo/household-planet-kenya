const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testMultiPayments() {
  try {
    // Login
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'john@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✓ Login successful');

    // Test Stripe Payment
    console.log('1. Testing Stripe payment...');
    const stripeResponse = await axios.post(`${BASE_URL}/payments/stripe/create-intent`, {
      amount: 1000,
      orderId: 'test-order-1'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✓ Stripe payment intent created:', stripeResponse.data);

    // Test Flutterwave Payment
    console.log('2. Testing Flutterwave payment...');
    const flutterwaveResponse = await axios.post(`${BASE_URL}/payments/flutterwave/initiate`, {
      amount: 1000,
      email: 'test@example.com',
      phoneNumber: '254712345678',
      orderId: 'test-order-2'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✓ Flutterwave payment initiated:', flutterwaveResponse.data);

    // Test Cash on Delivery
    console.log('3. Testing Cash on Delivery...');
    const codResponse = await axios.post(`${BASE_URL}/payments/cod/test-order-3`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✓ COD processed:', codResponse.data);

    // Test Bank Transfer
    console.log('4. Testing Bank Transfer...');
    const bankResponse = await axios.post(`${BASE_URL}/payments/bank-transfer/test-order-4`, {
      amount: 1500
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✓ Bank transfer initiated:', bankResponse.data);

    // Test Payment Dashboard (Admin only)
    console.log('5. Testing Payment Dashboard...');
    try {
      const dashboardResponse = await axios.get(`${BASE_URL}/payments/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✓ Payment dashboard:', dashboardResponse.data);
    } catch (error) {
      console.log('⚠ Dashboard access restricted (admin only)');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testMultiPayments();