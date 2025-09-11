const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const COMPLETE_LOCATIONS = [
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
  { name: 'Madaraka (Mombasa Rd) - Rider', tier: 2, price: 300, description: 'Via Rider', estimatedDays: 2, expressAvailable: true, expressPrice: 450 },
  { name: 'Makadara (Jogoo Rd) - Rider', tier: 2, price: 300, description: 'Via Rider', estimatedDays: 2, expressAvailable: true, expressPrice: 450 },
  { name: 'Mbagathi Way (Langata Rd) - Rider', tier: 2, price: 300, description: 'Via Rider', estimatedDays: 2, expressAvailable: true, expressPrice: 450 },
  { name: 'Mpaka Road', tier: 2, price: 300, estimatedDays: 2, expressAvailable: true, expressPrice: 450 },
  { name: 'Naivasha (Via NNUS)', tier: 2, price: 300, description: 'Via NNUS', estimatedDays: 3, expressAvailable: false },
  { name: 'Nanyuki (Nanyuki Cabs)', tier: 2, price: 300, description: 'Via Nanyuki Cabs', estimatedDays: 4, expressAvailable: false },
  { name: 'Parklands', tier: 2, price: 300, estimatedDays: 2, expressAvailable: true, expressPrice: 450 },
  { name: 'Riverside', tier: 2, price: 300, estimatedDays: 2, expressAvailable: true, expressPrice: 450 },
  { name: 'South B', tier: 2, price: 300, estimatedDays: 2, expressAvailable: true, expressPrice: 450 },
  { name: 'South C', tier: 2, price: 300, estimatedDays: 2, expressAvailable: true, expressPrice: 450 },
  { name: 'Westlands', tier: 2, price: 300, estimatedDays: 2, expressAvailable: true, expressPrice: 450 },

  // Tier 3 - Ksh 350-400
  { name: 'ABC (Waiyaki Way) - Rider', tier: 3, price: 350, description: 'Via Rider', estimatedDays: 2, expressAvailable: true, expressPrice: 500 },
  { name: 'Allsops, Ruaraka', tier: 3, price: 350, estimatedDays: 3, expressAvailable: true, expressPrice: 500 },
  { name: 'Bungoma (EasyCoach)', tier: 3, price: 350, description: 'Via EasyCoach', estimatedDays: 4, expressAvailable: false },
  { name: 'Carnivore (Langata) - Rider', tier: 3, price: 350, description: 'Via Rider', estimatedDays: 2, expressAvailable: true, expressPrice: 500 },
  { name: 'DCI (Kiambu Rd) - Rider', tier: 3, price: 350, description: 'Via Rider', estimatedDays: 2, expressAvailable: true, expressPrice: 500 },
  { name: 'Eldoret (North-rift Shuttle)', tier: 3, price: 350, description: 'Via North-rift Shuttle', estimatedDays: 4, expressAvailable: false },
  { name: 'Embu (Using Kukena)', tier: 3, price: 350, description: 'Via Kukena', estimatedDays: 4, expressAvailable: false },
  { name: 'Homa Bay (Easy Coach)', tier: 3, price: 350, description: 'Via Easy Coach', estimatedDays: 5, expressAvailable: false },
  { name: 'Imara Daima (Boda Rider)', tier: 3, price: 350, description: 'Via Boda Rider', estimatedDays: 2, expressAvailable: true, expressPrice: 500 },
  { name: 'Jamhuri Estate', tier: 3, price: 350, estimatedDays: 3, expressAvailable: true, expressPrice: 500 },
  { name: 'Kericho (Using EasyCoach)', tier: 3, price: 350, description: 'Via EasyCoach', estimatedDays: 4, expressAvailable: false },
  { name: 'Kisii (Using Easycoach)', tier: 3, price: 350, description: 'Via Easycoach', estimatedDays: 5, expressAvailable: false },
  { name: 'Kisumu (Easy Coach-United Mall)', tier: 3, price: 350, description: 'Via Easy Coach', estimatedDays: 5, expressAvailable: false },
  { name: 'Kitale (Northrift)', tier: 3, price: 350, description: 'Via Northrift', estimatedDays: 4, expressAvailable: false },
  { name: 'Lavington', tier: 3, price: 350, estimatedDays: 2, expressAvailable: true, expressPrice: 500 },
  { name: 'Mombasa (Dreamline Bus)', tier: 3, price: 350, description: 'Via Dreamline Bus', estimatedDays: 5, expressAvailable: false },
  { name: 'Nextgen Mall, Mombasa Road', tier: 3, price: 350, estimatedDays: 2, expressAvailable: true, expressPrice: 500 },
  { name: 'Roasters', tier: 3, price: 350, estimatedDays: 2, expressAvailable: true, expressPrice: 500 },
  { name: 'Rongo (Using EasyCoach)', tier: 3, price: 350, description: 'Via EasyCoach', estimatedDays: 5, expressAvailable: false },
  { name: 'Buruburu', tier: 3, price: 400, estimatedDays: 3, expressAvailable: true, expressPrice: 550 },
  { name: 'Donholm', tier: 3, price: 400, estimatedDays: 3, expressAvailable: true, expressPrice: 550 },
  { name: 'Kangemi', tier: 3, price: 400, estimatedDays: 3, expressAvailable: true, expressPrice: 550 },
  { name: 'Kasarani', tier: 3, price: 400, estimatedDays: 3, expressAvailable: true, expressPrice: 550 },
  { name: 'Kitisuru', tier: 3, price: 400, estimatedDays: 3, expressAvailable: true, expressPrice: 550 },
  { name: 'Lucky Summer', tier: 3, price: 400, estimatedDays: 3, expressAvailable: true, expressPrice: 550 },
  { name: 'Lumumba Drive', tier: 3, price: 400, estimatedDays: 3, expressAvailable: true, expressPrice: 550 },
  { name: 'Muthaiga', tier: 3, price: 400, estimatedDays: 3, expressAvailable: true, expressPrice: 550 },
  { name: 'Peponi Road', tier: 3, price: 400, estimatedDays: 3, expressAvailable: true, expressPrice: 550 },
  { name: 'Roysambu', tier: 3, price: 400, estimatedDays: 3, expressAvailable: true, expressPrice: 550 },
  { name: 'Thigiri', tier: 3, price: 400, estimatedDays: 3, expressAvailable: true, expressPrice: 550 },
  { name: 'Village Market', tier: 3, price: 400, estimatedDays: 3, expressAvailable: true, expressPrice: 550 },

  // Tier 4 - Ksh 450-600+
  { name: 'Kahawa Sukari', tier: 4, price: 550, estimatedDays: 4, expressAvailable: false },
  { name: 'Kahawa Wendani', tier: 4, price: 550, estimatedDays: 4, expressAvailable: false },
  { name: 'Karen', tier: 4, price: 650, estimatedDays: 3, expressAvailable: true, expressPrice: 800 },
  { name: 'Kiambu', tier: 4, price: 650, estimatedDays: 4, expressAvailable: false },
  { name: 'JKIA', tier: 4, price: 700, estimatedDays: 2, expressAvailable: true, expressPrice: 900 },
  { name: 'Ngong Town', tier: 4, price: 1000, estimatedDays: 4, expressAvailable: false }
];

async function seedCompleteLocations() {
  console.log('🌱 Seeding complete delivery locations...\n');

  try {
    // Clear existing locations
    await prisma.setting.deleteMany({
      where: {
        category: 'delivery_locations',
        key: { startsWith: 'location_' }
      }
    });

    console.log('✅ Cleared existing locations');

    // Add all locations
    for (let i = 0; i < COMPLETE_LOCATIONS.length; i++) {
      const location = COMPLETE_LOCATIONS[i];
      const id = (i + 1).toString();
      
      await prisma.setting.create({
        data: {
          category: 'delivery_locations',
          key: `location_${id}`,
          value: JSON.stringify({
            ...location,
            isActive: true
          }),
          type: 'json',
          description: `Delivery location: ${location.name}`,
          isPublic: true
        }
      });
    }

    console.log(`✅ Added ${COMPLETE_LOCATIONS.length} delivery locations`);
    
    // Show summary by tier
    const tierCounts = COMPLETE_LOCATIONS.reduce((acc, loc) => {
      acc[loc.tier] = (acc[loc.tier] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📊 Locations by tier:');
    Object.entries(tierCounts).forEach(([tier, count]) => {
      console.log(`  Tier ${tier}: ${count} locations`);
    });

    console.log('\n🎉 Complete delivery locations seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding locations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCompleteLocations();