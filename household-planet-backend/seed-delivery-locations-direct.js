const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedDeliveryLocations() {
  console.log('🚚 Seeding Delivery Locations to Database...\n');

  const locations = [
    // Tier 1 - Ksh 100-200
    { name: 'Nairobi CBD', tier: 1, price: 100, description: 'Orders within CBD only', estimatedDays: 1, expressAvailable: true, expressPrice: 200 },
    { name: 'Kajiado (Naekana)', tier: 1, price: 150, description: 'Via Naekana', estimatedDays: 2, expressAvailable: false },
    { name: 'Kitengela (Via Shuttle)', tier: 1, price: 150, description: 'Via Shuttle', estimatedDays: 2, expressAvailable: false },
    { name: 'Thika (Super Metrol)', tier: 1, price: 150, description: 'Via Super Metrol', estimatedDays: 2, expressAvailable: false },
    { name: 'Juja (Via Super Metrol)', tier: 1, price: 200, description: 'Via Super Metrol', estimatedDays: 3, expressAvailable: false },
    { name: 'Kikuyu Town (Super Metrol)', tier: 1, price: 200, description: 'Via Super Metrol', estimatedDays: 3, expressAvailable: false },

    // Tier 2 - Ksh 250-300
    { name: 'Pangani', tier: 2, price: 250, estimatedDays: 2, expressAvailable: true, expressPrice: 400 },
    { name: 'Upperhill', tier: 2, price: 250, estimatedDays: 2, expressAvailable: true, expressPrice: 400 },
    { name: 'Eastleigh', tier: 2, price: 300, estimatedDays: 2, expressAvailable: true, expressPrice: 450 },
    { name: 'Westlands', tier: 2, price: 300, estimatedDays: 2, expressAvailable: true, expressPrice: 450 },

    // Tier 3 - Ksh 350-400
    { name: 'Karen', tier: 3, price: 350, estimatedDays: 3, expressAvailable: true, expressPrice: 500 },
    { name: 'Lavington', tier: 3, price: 350, estimatedDays: 2, expressAvailable: true, expressPrice: 500 },
    { name: 'Kilimani', tier: 3, price: 400, estimatedDays: 3, expressAvailable: true, expressPrice: 550 },

    // Tier 4 - Ksh 450-1000
    { name: 'JKIA', tier: 4, price: 700, estimatedDays: 2, expressAvailable: true, expressPrice: 900 },
    { name: 'Ngong Town', tier: 4, price: 1000, estimatedDays: 4, expressAvailable: false }
  ];

  try {
    // Check existing locations
    const existing = await prisma.setting.findMany({
      where: {
        category: 'delivery_locations',
        key: { startsWith: 'location_' }
      }
    });

    console.log(`📊 Found ${existing.length} existing delivery locations`);

    if (existing.length > 0) {
      console.log('✅ Delivery locations already exist!');
      existing.forEach((setting, index) => {
        const data = JSON.parse(setting.value);
        console.log(`${index + 1}. ${data.name} - KSh ${data.price}`);
      });
      return;
    }

    console.log('🌱 Adding delivery locations...');
    let added = 0;

    for (const location of locations) {
      try {
        const locationData = {
          ...location,
          isActive: true
        };

        await prisma.setting.create({
          data: {
            category: 'delivery_locations',
            key: `location_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            value: JSON.stringify(locationData),
            type: 'json',
            description: `Delivery location: ${location.name}`,
            isPublic: true
          }
        });

        console.log(`✅ Added: ${location.name} - KSh ${location.price} (${location.estimatedDays} days)`);
        added++;
      } catch (error) {
        console.log(`❌ Failed to add ${location.name}: ${error.message}`);
      }
    }

    console.log(`\n🎉 Successfully added ${added}/${locations.length} delivery locations!`);

    // Verify
    const final = await prisma.setting.findMany({
      where: {
        category: 'delivery_locations',
        key: { startsWith: 'location_' }
      }
    });

    console.log(`\n✅ Total delivery locations: ${final.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

seedDeliveryLocations();