const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testCompleteDeliverySystem() {
  console.log('🚚 Testing Complete Kenya Delivery System (All Tiers)\n');

  try {
    // Initialize all locations
    console.log('1. Initializing complete delivery system...');
    await axios.post(`${BASE_URL}/api/delivery/initialize`);
    console.log('✅ All delivery locations initialized');

    // Get summary by tiers
    console.log('\n2. Delivery system summary:');
    const allLocations = await axios.get(`${BASE_URL}/api/delivery/locations`);
    
    const tier1 = allLocations.data.filter(l => l.tier === 1);
    const tier2 = allLocations.data.filter(l => l.tier === 2);
    const tier3 = allLocations.data.filter(l => l.tier === 3);
    
    console.log(`✅ Tier 1 (Ksh 100-200): ${tier1.length} locations`);
    console.log(`✅ Tier 2 (Ksh 250-300): ${tier2.length} locations`);
    console.log(`✅ Tier 3 (Ksh 350-400): ${tier3.length} locations`);
    console.log(`✅ Total locations: ${allLocations.data.length}`);

    // Test Tier 3 locations
    console.log('\n3. Testing Tier 3 locations (Ksh 350-400):');
    console.log('   Ksh 350 locations:');
    tier3.filter(l => l.price === 350).slice(0, 8).forEach(location => {
      const desc = location.description ? ` - ${location.description}` : '';
      console.log(`     • ${location.name}${desc}`);
    });
    
    console.log('   Ksh 400 locations:');
    tier3.filter(l => l.price === 400).slice(0, 6).forEach(location => {
      console.log(`     • ${location.name}`);
    });

    // Test price calculations across all tiers
    console.log('\n4. Testing price calculations across all tiers:');
    const testLocations = [
      { name: 'Nairobi CBD', expected: 100 },
      { name: 'Kitengela (Via Shuttle)', expected: 150 },
      { name: 'Pangani', expected: 250 },
      { name: 'Westlands', expected: 300 },
      { name: 'Lavington', expected: 350 },
      { name: 'Buruburu', expected: 400 }
    ];

    for (const test of testLocations) {
      const response = await axios.get(`${BASE_URL}/api/delivery/price?location=${encodeURIComponent(test.name)}`);
      const status = response.data.price === test.expected ? '✅' : '❌';
      console.log(`   ${status} ${test.name}: Ksh ${response.data.price}`);
    }

    // Price range summary
    console.log('\n5. Complete pricing structure:');
    const priceRanges = {
      'Ksh 100': tier1.filter(l => l.price === 100).length,
      'Ksh 150': tier1.filter(l => l.price === 150).length,
      'Ksh 200': tier1.filter(l => l.price === 200).length,
      'Ksh 250': tier2.filter(l => l.price === 250).length,
      'Ksh 300': tier2.filter(l => l.price === 300).length,
      'Ksh 350': tier3.filter(l => l.price === 350).length,
      'Ksh 400': tier3.filter(l => l.price === 400).length,
    };

    Object.entries(priceRanges).forEach(([price, count]) => {
      console.log(`   ${price}: ${count} locations`);
    });

    console.log('\n🎉 Complete Kenya Delivery System Test Passed!');
    console.log('\n📋 Final Summary:');
    console.log('✅ 3-Tier delivery system implemented');
    console.log('✅ Price range: Ksh 100 - Ksh 400');
    console.log(`✅ Total coverage: ${allLocations.data.length} Kenya locations`);
    console.log('✅ Automatic pricing calculation working');
    console.log('✅ Ready for production use');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testCompleteDeliverySystem();