const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedBrands() {
  try {
    console.log('Seeding brands...');
    
    const brands = [
      { name: 'Samsung', slug: 'samsung', isActive: true },
      { name: 'LG', slug: 'lg', isActive: true },
      { name: 'Sony', slug: 'sony', isActive: true },
      { name: 'Philips', slug: 'philips', isActive: true },
      { name: 'Panasonic', slug: 'panasonic', isActive: true },
      { name: 'Whirlpool', slug: 'whirlpool', isActive: true },
      { name: 'Bosch', slug: 'bosch', isActive: true },
      { name: 'Electrolux', slug: 'electrolux', isActive: true }
    ];
    
    for (const brand of brands) {
      const existing = await prisma.brand.findUnique({
        where: { slug: brand.slug }
      });
      
      if (!existing) {
        await prisma.brand.create({ data: brand });
        console.log(`✅ Created brand: ${brand.name}`);
      } else {
        console.log(`⏭️  Brand already exists: ${brand.name}`);
      }
    }
    
    console.log('✅ Brands seeding completed!');
    
  } catch (error) {
    console.error('❌ Error seeding brands:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedBrands();