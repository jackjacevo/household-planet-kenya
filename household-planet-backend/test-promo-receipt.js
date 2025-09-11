const axios = require('axios');

async function testPromoReceipt() {
  try {
    // Login as admin
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@householdplanet.co.ke',
      password: 'HouseholdAdmin2024!'
    });
    
    const token = loginResponse.data.token;
    console.log('Login successful');
    
    // Test receipt generation for order 32 (the promo code order)
    console.log('Testing receipt generation for order 32...');
    const receiptResponse = await axios.get('http://localhost:3001/api/payments/receipt/32', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('Receipt generated successfully!');
    console.log('Receipt data:');
    console.log('- Order Number:', receiptResponse.data.orderNumber);
    console.log('- Promo Code:', receiptResponse.data.promoCode);
    console.log('- Subtotal:', receiptResponse.data.totals.subtotal);
    console.log('- Discount:', receiptResponse.data.totals.discount);
    console.log('- Shipping:', receiptResponse.data.totals.shipping);
    console.log('- Total:', receiptResponse.data.totals.total);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testPromoReceipt();