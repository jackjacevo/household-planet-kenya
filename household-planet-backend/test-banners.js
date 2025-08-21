const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testBanners() {
  try {
    console.log('Testing banner data...');
    
    // Get all banners
    const allBanners = await prisma.banner.findMany();
    console.log('All banners:', allBanners.length);
    
    // Get HERO banners specifically
    const heroBanners = await prisma.banner.findMany({
      where: {
        isActive: true,
        position: 'HERO'
      },
      orderBy: { sortOrder: 'asc' }
    });
    
    console.log('HERO banners:', heroBanners.length);
    console.log('Banner details:', JSON.stringify(heroBanners, null, 2));
    
  } catch (error) {
    console.error('Error testing banners:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBanners();