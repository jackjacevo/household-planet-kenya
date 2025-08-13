const axios = require('axios');

async function simpleTest() {
  try {
    console.log('🚀 Simple WhatsApp Test...\n');

    // Test public endpoint first
    console.log('1. Testing public contact info endpoint...');
    const contactResponse = await axios.get('http://localhost:3001/whatsapp/contact-info');
    console.log('✅ Contact info:', contactResponse.data);

    // Test abandoned cart tracking (public)
    console.log('\n2. Testing abandoned cart tracking...');
    const cartResponse = await axios.post('http://localhost:3001/whatsapp/abandoned-cart/track', {
      phoneNumber: '+254700000000',
      cartItems: [
        {
          productId: 'test-product-1',
          quantity: 2,
          price: 1500,
          name: 'Test Kitchen Appliance'
        }
      ]
    });
    console.log('✅ Cart tracking:', cartResponse.data);

    // Test quick inquiry (public)
    console.log('\n3. Testing quick inquiry...');
    const inquiryResponse = await axios.post('http://localhost:3001/whatsapp/quick-inquiry', {
      phoneNumber: '+254700000000',
      productName: 'Test Product',
      productUrl: 'https://householdplanet.co.ke/products/test',
      message: 'Test inquiry message'
    });
    console.log('✅ Quick inquiry:', inquiryResponse.data);

    console.log('\n🎉 All public WhatsApp endpoints working!');
    console.log('\n📋 Test Summary:');
    console.log('✅ Contact info endpoint');
    console.log('✅ Abandoned cart tracking');
    console.log('✅ Quick inquiry system');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

simpleTest();