const axios = require('axios');

async function testApiDeliveryEndpoint() {
  try {
    console.log('🔍 Testing API delivery endpoint...\n');

    // Test the API delivery locations endpoint
    console.log('1. Testing /api/delivery/locations...');
    const locationsResponse = await axios.get('http://localhost:3001/api/delivery/locations');
    console.log('✅ API Delivery locations response:', locationsResponse.data);
    console.log(`Found ${locationsResponse.data.data?.length || 0} total locations`);

    if (locationsResponse.data.data?.length > 0) {
      // Group by tier
      const locationsByTier = locationsResponse.data.data.reduce((acc, location) => {
        if (!acc[location.tier]) {
          acc[location.tier] = [];
        }
        acc[location.tier].push(location);
        return acc;
      }, {});

      console.log('\nLocations by tier:');
      Object.keys(locationsByTier).sort().forEach(tier => {
        console.log(`Tier ${tier}: ${locationsByTier[tier].length} locations`);
        locationsByTier[tier].slice(0, 2).forEach(location => {
          console.log(`  - ${location.name}: Ksh ${location.price}`);
        });
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testApiDeliveryEndpoint();