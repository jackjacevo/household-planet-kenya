const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function testWhatsAppOrderWithEmail() {
  try {
    // First, get admin token
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'admin@householdplanet.co.ke',
      password: 'Admin@2024!'
    });

    const token = loginResponse.data.access_token;
    console.log('✅ Admin login successful');

    // Test 1: Create WhatsApp order with Gmail
    const orderWithEmail = {
      customerPhone: '+254712345678',
      customerName: 'John Doe',
      customerEmail: 'john.doe@gmail.com',
      orderDetails: '2x Cooking Oil 1L, 1x Rice 2kg',
      deliveryLocation: 'Nairobi CBD - Ksh 100',
      deliveryCost: 100,
      estimatedTotal: 500,
      paymentMode: 'CASH',
      deliveryType: 'DELIVERY',
      notes: 'Test order with Gmail'
    };

    const response1 = await axios.post(
      `${API_URL}/api/orders/whatsapp`,
      orderWithEmail,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    console.log('✅ WhatsApp order with Gmail created:', response1.data.orderNumber);

    // Test 2: Create WhatsApp order without email (should use temp email)
    const orderWithoutEmail = {
      customerPhone: '+254798765432',
      customerName: 'Jane Smith',
      orderDetails: '1x Soap 500g, 2x Detergent 1kg',
      deliveryLocation: 'Westlands - Ksh 300',
      deliveryCost: 300,
      estimatedTotal: 800,
      paymentMode: 'PAYBILL',
      deliveryType: 'DELIVERY',
      notes: 'Test order without Gmail'
    };

    const response2 = await axios.post(
      `${API_URL}/api/orders/whatsapp`,
      orderWithoutEmail,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    console.log('✅ WhatsApp order without Gmail created:', response2.data.orderNumber);

    // Check customers to see the difference
    const customersResponse = await axios.get(
      `${API_URL}/api/customers/search?q=`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    console.log('\n📋 Recent customers:');
    customersResponse.data.slice(0, 5).forEach(customer => {
      console.log(`- ${customer.name} (${customer.email}) - Phone: ${customer.phone}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testWhatsAppOrderWithEmail();