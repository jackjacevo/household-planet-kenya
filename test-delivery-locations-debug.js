const axios = require('axios');

async function testDeliveryLocations() {
  try {
    console.log('🔍 Testing delivery locations API...\n');

    // Test 1: Check if delivery locations exist in settings
    console.log('1. Checking delivery locations in settings...');
    const settingsResponse = await axios.get('http://localhost:3001/api/settings');
    const deliverySettings = settingsResponse.data.filter(setting => 
      setting.category === 'delivery_locations'
    );
    console.log(`Found ${deliverySettings.length} delivery location settings`);
    
    if (deliverySettings.length > 0) {
      console.log('Sample delivery location:', deliverySettings[0]);
    }

    // Test 2: Try to access admin delivery locations endpoint (without auth)
    console.log('\n2. Testing admin delivery locations endpoint...');
    try {
      const adminResponse = await axios.get('http://localhost:3001/admin/delivery-locations');
      console.log('Admin endpoint response:', adminResponse.data);
    } catch (error) {
      console.log('Admin endpoint error (expected without auth):', error.response?.status, error.response?.data?.message);
    }

    // Test 3: Check if there's a public delivery locations endpoint
    console.log('\n3. Testing public delivery locations endpoint...');
    try {
      const publicResponse = await axios.get('http://localhost:3001/api/delivery-locations');
      console.log('Public endpoint response:', publicResponse.data);
    } catch (error) {
      console.log('Public endpoint error:', error.response?.status, error.response?.data?.message);
    }

    // Test 4: Check delivery endpoints
    console.log('\n4. Testing delivery endpoints...');
    try {
      const deliveryResponse = await axios.get('http://localhost:3001/api/delivery');
      console.log('Delivery endpoint response:', deliveryResponse.data);
    } catch (error) {
      console.log('Delivery endpoint error:', error.response?.status, error.response?.data?.message);
    }

  } catch (error) {
    console.error('❌ Error testing delivery locations:', error.message);
  }
}

testDeliveryLocations();