const axios = require('axios');

const API_BASE = 'http://localhost:3001';

// Test data
const testData = {
  adminToken: '', // Will be set after login
  testPhoneNumber: '+254700000000', // Replace with actual test number
  testUserId: '',
  testOrderId: ''
};

async function testWhatsAppIntegration() {
  console.log('🚀 Testing WhatsApp Business Integration...\n');

  try {
    // 1. Admin Login
    console.log('1. Admin Login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@householdplanet.co.ke',
      password: 'AdminPass123!'
    });
    
    testData.adminToken = loginResponse.data.access_token;
    console.log('✅ Admin login successful\n');

    // 2. Check WhatsApp Status
    console.log('2. Checking WhatsApp Status...');
    const statusResponse = await axios.get(`${API_BASE}/whatsapp/status`, {
      headers: { Authorization: `Bearer ${testData.adminToken}` }
    });
    
    console.log('WhatsApp Status:', statusResponse.data);
    if (statusResponse.data.qrCode) {
      console.log('📱 QR Code available for WhatsApp authentication');
    }
    console.log('✅ WhatsApp status checked\n');

    // 3. Seed WhatsApp Templates
    console.log('3. Seeding WhatsApp Templates...');
    await axios.post(`${API_BASE}/whatsapp/templates/seed`, {}, {
      headers: { Authorization: `Bearer ${testData.adminToken}` }
    });
    console.log('✅ WhatsApp templates seeded\n');

    // 4. Get Templates
    console.log('4. Getting WhatsApp Templates...');
    const templatesResponse = await axios.get(`${API_BASE}/whatsapp/templates`, {
      headers: { Authorization: `Bearer ${testData.adminToken}` }
    });
    
    console.log(`Found ${templatesResponse.data.length} templates:`);
    templatesResponse.data.forEach(template => {
      console.log(`  - ${template.name} (${template.type})`);
    });
    console.log('✅ Templates retrieved\n');

    // 5. Test Manual Message Send
    console.log('5. Testing Manual Message Send...');
    const messageResponse = await axios.post(`${API_BASE}/whatsapp/send`, {
      phoneNumber: testData.testPhoneNumber,
      message: 'Test message from Household Planet Kenya WhatsApp integration!',
      type: 'TEST'
    }, {
      headers: { Authorization: `Bearer ${testData.adminToken}` }
    });
    
    console.log('Message send result:', messageResponse.data);
    console.log('✅ Manual message test completed\n');

    // 6. Test Abandoned Cart Tracking
    console.log('6. Testing Abandoned Cart Tracking...');
    await axios.post(`${API_BASE}/whatsapp/abandoned-cart/track`, {
      phoneNumber: testData.testPhoneNumber,
      cartItems: [
        {
          productId: 'test-product-1',
          quantity: 2,
          price: 1500,
          name: 'Test Kitchen Appliance'
        }
      ]
    });
    console.log('✅ Abandoned cart tracking test completed\n');

    // 7. Test Promotional Message
    console.log('7. Testing Promotional Message...');
    const promoResponse = await axios.post(`${API_BASE}/whatsapp/send-promotional`, {
      phoneNumbers: [testData.testPhoneNumber],
      title: 'Special Offer!',
      description: 'Get 20% off on all kitchen appliances this week!',
      link: 'https://householdplanet.co.ke/categories/kitchen'
    }, {
      headers: { Authorization: `Bearer ${testData.adminToken}` }
    });
    
    console.log('Promotional message result:', promoResponse.data);
    console.log('✅ Promotional message test completed\n');

    // 8. Get WhatsApp Statistics
    console.log('8. Getting WhatsApp Statistics...');
    const statsResponse = await axios.get(`${API_BASE}/whatsapp/stats`, {
      headers: { Authorization: `Bearer ${testData.adminToken}` }
    });
    
    console.log('WhatsApp Statistics:');
    console.log('  Messages:', statsResponse.data.messages);
    console.log('  Abandoned Carts:', statsResponse.data.abandonedCarts);
    console.log('✅ Statistics retrieved\n');

    // 9. Get Message History
    console.log('9. Getting Message History...');
    const historyResponse = await axios.get(`${API_BASE}/whatsapp/messages?limit=10`, {
      headers: { Authorization: `Bearer ${testData.adminToken}` }
    });
    
    console.log(`Found ${historyResponse.data.length} recent messages`);
    historyResponse.data.forEach(msg => {
      console.log(`  - ${msg.type}: ${msg.message.substring(0, 50)}... (${msg.status})`);
    });
    console.log('✅ Message history retrieved\n');

    // 10. Test Contact Info Endpoint (Public)
    console.log('10. Testing Contact Info Endpoint...');
    const contactResponse = await axios.get(`${API_BASE}/whatsapp/contact-info`);
    console.log('Contact Info:', contactResponse.data);
    console.log('✅ Contact info test completed\n');

    console.log('🎉 All WhatsApp Integration Tests Completed Successfully!');
    console.log('\n📋 Test Summary:');
    console.log('✅ WhatsApp client status check');
    console.log('✅ Template management');
    console.log('✅ Manual message sending');
    console.log('✅ Abandoned cart tracking');
    console.log('✅ Promotional messages');
    console.log('✅ Statistics and reporting');
    console.log('✅ Message history');
    console.log('✅ Public contact info');

    console.log('\n🔧 Next Steps:');
    console.log('1. Scan QR code to authenticate WhatsApp Business account');
    console.log('2. Update WHATSAPP_BUSINESS_NUMBER in .env file');
    console.log('3. Test with real phone numbers');
    console.log('4. Configure automated abandoned cart reminders');
    console.log('5. Set up promotional message campaigns');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('💡 Tip: Make sure admin user exists and credentials are correct');
    }
    
    if (error.response?.status === 500) {
      console.log('💡 Tip: Check if the backend server is running and database is accessible');
    }
  }
}

// Run the test
testWhatsAppIntegration();