const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const deliveryLocations = [
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
  { name: 'Bomet (Easycoach)', tier: 2, price: 300, description: 'Via Easycoach', estimatedDays: 3, expressAvailable: false },
  { name: 'Eastleigh', tier: 2, price: 300, estimatedDays: 2, expressAvailable: true, expressPrice: 450 },
  { name: 'Hurlingham (Ngong Rd) - Rider', tier: 2, price: 300, description: 'Via Rider', estimatedDays: 2, expressAvailable: true, expressPrice: 450 },
  { name: 'Industrial Area - Rider', tier: 2, price: 300, description: 'Via Rider', estimatedDays: 2, expressAvailable: true, expressPrice: 450 },
  { name: 'Kileleshwa', tier: 2, price: 300, estimatedDays: 2, expressAvailable: true, expressPrice: 450 },
  { name: 'Kilimani', tier: 2, price: 300, estimatedDays: 2, expressAvailable: true, expressPrice: 450 },
  { name: 'Machakos (Makos Sacco)', tier: 2, price: 300, description: 'Via Makos Sacco', estimatedDays: 3, expressAvailable: false },
  { name: 'Westlands', tier: 2, price: 300, estimatedDays: 2, expressAvailable: true, expressPrice: 450 },

  // Tier 3 - Ksh 350-400
  { name: 'Karen', tier: 3, price: 350, estimatedDays: 3, expressAvailable: true, expressPrice: 500 },
  { name: 'Lavington', tier: 3, price: 350, estimatedDays: 2, expressAvailable: true, expressPrice: 500 },
  { name: 'Kilimani', tier: 3, price: 400, estimatedDays: 3, expressAvailable: true, expressPrice: 550 },
  { name: 'Buruburu', tier: 3, price: 400, estimatedDays: 3, expressAvailable: true, expressPrice: 550 },
  { name: 'Donholm', tier: 3, price: 400, estimatedDays: 3, expressAvailable: true, expressPrice: 550 },
  { name: 'Kangemi', tier: 3, price: 400, estimatedDays: 3, expressAvailable: true, expressPrice: 550 },
  { name: 'Kasarani', tier: 3, price: 400, estimatedDays: 3, expressAvailable: true, expressPrice: 550 },

  // Tier 4 - Ksh 450-1000
  { name: 'Kahawa Sukari', tier: 4, price: 550, estimatedDays: 4, expressAvailable: false },
  { name: 'Kahawa Wendani', tier: 4, price: 550, estimatedDays: 4, expressAvailable: false },
  { name: 'Karen', tier: 4, price: 650, estimatedDays: 3, expressAvailable: true, expressPrice: 800 },
  { name: 'Kiambu', tier: 4, price: 650, estimatedDays: 4, expressAvailable: false },
  { name: 'JKIA', tier: 4, price: 700, estimatedDays: 2, expressAvailable: true, expressPrice: 900 },
  { name: 'Ngong Town', tier: 4, price: 1000, estimatedDays: 4, expressAvailable: false },
];

async function seedDeliveryLocations() {
  console.log('🚀 Seeding delivery locations...');

  try {
    // Clear existing delivery locations
    await prisma.setting.deleteMany({
      where: {
        category: 'delivery_locations'
      }
    });

    console.log('✅ Cleared existing delivery locations');

    // Create new delivery locations
    for (let i = 0; i < deliveryLocations.length; i++) {
      const location = deliveryLocations[i];
      const id = (i + 1).toString();
      
      const data = {
        ...location,
        isActive: true
      };

      await prisma.setting.create({
        data: {
          category: 'delivery_locations',
          key: `location_${id}`,
          value: JSON.stringify(data),
          type: 'json',
          description: `Delivery location: ${location.name}`,
          isPublic: true
        }
      });

      console.log(`✅ Created location: ${location.name} (Tier ${location.tier}, Ksh ${location.price})`);
    }

    console.log(`\n🎉 Successfully seeded ${deliveryLocations.length} delivery locations!`);

    // Display summary
    const tierCounts = deliveryLocations.reduce((acc, location) => {
      acc[location.tier] = (acc[location.tier] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📊 Summary:');
    Object.entries(tierCounts).forEach(([tier, count]) => {
      console.log(`   Tier ${tier}: ${count} locations`);
    });

  } catch (error) {
    console.error('❌ Error seeding delivery locations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDeliveryLocations();