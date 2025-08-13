const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testTier2Delivery() {
  console.log('🚚 Testing Tier 2 Kenya Delivery Locations (Ksh 250-300)\n');

  try {
    // Initialize all locations including Tier 2
    console.log('1. Initializing delivery locations...');
    await axios.post(`${BASE_URL}/api/delivery/initialize`);
    console.log('✅ All delivery locations initialized');

    // Test Tier 2 locations
    console.log('\n2. Testing Tier 2 locations (Ksh 250-300):');
    const tier2Response = await axios.get(`${BASE_URL}/api/delivery/locations/tier?tier=2`);
    
    console.log(`✅ Found ${tier2Response.data.length} Tier 2 locations:`);
    tier2Response.data.forEach(location => {
      const desc = location.description ? ` - ${location.description}` : '';
      console.log(`   • ${location.name}: Ksh ${location.price}${desc}`);
    });

    // Test specific Tier 2 price calculations
    console.log('\n3. Testing price calculations:');
    const testLocations = [
      'Pangani', 'Upperhill', 'Bomet (Easycoach)', 'Eastleigh', 
      'Kileleshwa', 'Westlands', 'South B', 'Parklands'
    ];

    for (const location of testLocations) {
      const priceResponse = await axios.get(`${BASE_URL}/api/delivery/price?location=${encodeURIComponent(location)}`);
      console.log(`   ${location}: Ksh ${priceResponse.data.price}`);
    }

    // Summary
    console.log('\n4. All delivery tiers summary:');
    const allLocations = await axios.get(`${BASE_URL}/api/delivery/locations`);
    const tier1Count = allLocations.data.filter(l => l.tier === 1).length;
    const tier2Count = allLocations.data.filter(l => l.tier === 2).length;
    
    console.log(`✅ Tier 1 (Ksh 100-200): ${tier1Count} locations`);
    console.log(`✅ Tier 2 (Ksh 250-300): ${tier2Count} locations`);
    console.log(`✅ Total delivery locations: ${allLocations.data.length}`);

    console.log('\n🎉 Tier 2 Delivery System Test Completed Successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testTier2Delivery();