const axios = require('axios');

async function testPublicDeliveryLocations() {
  try {
    console.log('🔍 Testing public delivery locations endpoint...\n');

    // Test 1: Get all delivery locations
    console.log('1. Testing all delivery locations...');
    const allLocationsResponse = await axios.get('http://localhost:3001/simple-delivery/locations');
    console.log('✅ All locations response:', allLocationsResponse.data);
    console.log(`Found ${allLocationsResponse.data.data?.length || 0} total locations`);

    // Test 2: Get locations by tier
    console.log('\n2. Testing locations by tier...');
    for (let tier = 1; tier <= 4; tier++) {
      const tierResponse = await axios.get(`http://localhost:3001/simple-delivery/locations/tier/${tier}`);
      console.log(`Tier ${tier}: ${tierResponse.data.data?.length || 0} locations`);
      
      if (tierResponse.data.data?.length > 0) {
        console.log(`  Sample: ${tierResponse.data.data[0].name} - Ksh ${tierResponse.data.data[0].price}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testPublicDeliveryLocations();