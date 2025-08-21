// Payment System Testing Script
const axios = require('axios');

const API_BASE = process.env.API_URL || 'https://api.householdplanet.co.ke';

async function testPaymentMethods() {
  console.log('🔄 Testing Payment Methods...');
  
  const testOrder = {
    items: [{ productId: 1, quantity: 1, price: 100 }],
    total: 100,
    customerPhone: '+254700000000'
  };

  // Test M-Pesa STK Push
  try {
    const mpesaResponse = await axios.post(`${API_BASE}/api/payments/mpesa/stk-push`, {
      ...testOrder,
      phoneNumber: '+254700000000'
    });
    console.log('✅ M-Pesa STK Push: Working');
  } catch (error) {
    console.log('❌ M-Pesa STK Push: Failed', error.message);
  }

  // Test Card Payment
  try {
    const cardResponse = await axios.post(`${API_BASE}/api/payments/card`, {
      ...testOrder,
      cardToken: 'test_card_token'
    });
    console.log('✅ Card Payment: Working');
  } catch (error) {
    console.log('❌ Card Payment: Failed', error.message);
  }

  // Test Payment Status Check
  try {
    const statusResponse = await axios.get(`${API_BASE}/api/payments/status/test123`);
    console.log('✅ Payment Status Check: Working');
  } catch (error) {
    console.log('❌ Payment Status Check: Failed', error.message);
  }
}

async function testMpesaCallback() {
  console.log('🔄 Testing M-Pesa Callback...');
  
  const callbackData = {
    Body: {
      stkCallback: {
        MerchantRequestID: 'test123',
        CheckoutRequestID: 'test456',
        ResultCode: 0,
        ResultDesc: 'The service request is processed successfully.'
      }
    }
  };

  try {
    const response = await axios.post(`${API_BASE}/api/payments/mpesa/callback`, callbackData);
    console.log('✅ M-Pesa Callback: Working');
  } catch (error) {
    console.log('❌ M-Pesa Callback: Failed', error.message);
  }
}

testPaymentMethods();
testMpesaCallback();