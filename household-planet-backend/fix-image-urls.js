const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixImageUrls() {
  try {
    // Fix banner images
    await prisma.banner.updateMany({
      data: {
        image: '/images/hero-bg.jpg'
      }
    });

    // Fix product images
    const products = await prisma.product.findMany();
    
    for (const product of products) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          images: JSON.stringify(['/images/products/placeholder.svg'])
        }
      });
    }

    console.log('Image URLs fixed successfully!');
    console.log('Updated banners and products to use correct image paths');
  } catch (error) {
    console.error('Error fixing image URLs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixImageUrls();