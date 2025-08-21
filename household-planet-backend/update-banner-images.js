const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateBannerImages() {
  try {
    // Update all banners to use the SVG hero background
    await prisma.banner.updateMany({
      data: {
        image: '/images/hero-bg.svg'
      }
    });

    console.log('Banner images updated successfully!');
    console.log('All banners now use /images/hero-bg.svg');
  } catch (error) {
    console.error('Error updating banner images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateBannerImages();