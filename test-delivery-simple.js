const axios = require('axios');

async function testDeliveryEndpoints() {
  try {
    console.log('🔍 Testing delivery endpoints...\n');

    // Test 1: Check settings for delivery locations
    console.log('1. Checking delivery location settings...');
    const settingsResponse = await axios.get('http://localhost:3001/api/settings');
    const deliverySettings = settingsResponse.data.filter(setting => 
      setting.category === 'delivery_locations'
    );
    console.log(`Found ${deliverySettings.length} delivery location settings`);
    
    if (deliverySettings.length > 0) {
      console.log('Sample delivery location setting:', {
        key: deliverySettings[0].key,
        value: JSON.parse(deliverySettings[0].value)
      });
    }

    // Test 2: Try to access delivery locations via settings API
    console.log('\n2. Testing delivery locations via settings API...');
    const deliveryLocationSettings = await axios.get('http://localhost:3001/api/settings/delivery_locations');
    console.log('Delivery locations from settings:', deliveryLocationSettings.data);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testDeliveryEndpoints();