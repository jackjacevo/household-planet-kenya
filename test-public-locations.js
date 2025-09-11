const fetch = require('node-fetch');

async function testPublicLocations() {
  console.log('🌍 Testing public delivery locations API...\n');

  try {
    const response = await fetch('http://localhost:3001/api/delivery/locations');
    
    if (response.ok) {
      const data = await response.json();
      const locations = data.data || [];
      
      console.log(`✅ Found ${locations.length} delivery locations`);
      
      // Group by tier
      const tierCounts = locations.reduce((acc, loc) => {
        acc[loc.tier] = (acc[loc.tier] || 0) + 1;
        return acc;
      }, {});
      
      console.log('\n📊 Locations by tier:');
      Object.entries(tierCounts).forEach(([tier, count]) => {
        console.log(`  Tier ${tier}: ${count} locations`);
      });
      
      // Show sample locations from each tier
      console.log('\n📍 Sample locations:');
      [1, 2, 3, 4].forEach(tier => {
        const tierLocations = locations.filter(l => l.tier === tier);
        if (tierLocations.length > 0) {
          const sample = tierLocations[0];
          console.log(`  Tier ${tier}: ${sample.name} - Ksh ${sample.price}`);
        }
      });
      
      // Verify specific locations exist
      const keyLocations = [
        'Nairobi CBD',
        'Karen',
        'Westlands', 
        'JKIA',
        'Ngong Town'
      ];
      
      console.log('\n🔍 Checking key locations:');
      keyLocations.forEach(name => {
        const found = locations.find(l => l.name.includes(name));
        if (found) {
          console.log(`  ✅ ${found.name} - Tier ${found.tier} - Ksh ${found.price}`);
        } else {
          console.log(`  ❌ ${name} - Not found`);
        }
      });
      
    } else {
      console.log('❌ Failed to fetch locations:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testPublicLocations();