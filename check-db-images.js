const { PrismaClient } = require('@prisma/client');

async function checkImages() {
  const prisma = new PrismaClient();
  
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        images: true
      }
    });
    
    console.log('Products in database:');
    products.forEach(product => {
      console.log(`\nProduct ${product.id}: ${product.name}`);
      console.log('Raw images field:', product.images);
      
      try {
        const parsedImages = JSON.parse(product.images);
        console.log('Parsed images:', parsedImages);
      } catch (e) {
        console.log('Failed to parse images JSON');
      }
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkImages();