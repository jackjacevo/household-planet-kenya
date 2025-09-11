const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDeliveryData() {
  try {
    console.log('🔍 Checking delivery locations data...\n');

    // Check delivery location settings
    const deliverySettings = await prisma.setting.findMany({
      where: {
        category: 'delivery_locations'
      }
    });

    console.log(`Found ${deliverySettings.length} delivery location settings`);

    if (deliverySettings.length > 0) {
      console.log('\nDelivery locations by tier:');
      
      const locationsByTier = {};
      
      deliverySettings.forEach(setting => {
        const data = JSON.parse(setting.value);
        const tier = data.tier;
        
        if (!locationsByTier[tier]) {
          locationsByTier[tier] = [];
        }
        
        locationsByTier[tier].push({
          name: data.name,
          price: data.price,
          description: data.description
        });
      });

      Object.keys(locationsByTier).sort().forEach(tier => {
        console.log(`\nTier ${tier} (${locationsByTier[tier].length} locations):`);
        locationsByTier[tier].forEach(location => {
          console.log(`  - ${location.name}: Ksh ${location.price}${location.description ? ` (${location.description})` : ''}`);
        });
      });
    } else {
      console.log('❌ No delivery locations found in database');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDeliveryData();