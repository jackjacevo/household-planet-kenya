const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixProductImages() {
  try {
    // Get all products
    const products = await prisma.product.findMany();
    
    console.log(`Found ${products.length} products`);
    
    for (const product of products) {
      let images;
      try {
        images = JSON.parse(product.images);
      } catch {
        images = [];
      }
      
      // If no images or images are invalid URLs, set placeholder
      if (!images || images.length === 0 || images.some(img => !img.startsWith('http'))) {
        const updatedImages = ['http://localhost:3001/uploads/products/placeholder.svg'];
        
        await prisma.product.update({
          where: { id: product.id },
          data: {
            images: JSON.stringify(updatedImages)
          }
        });
        
        console.log(`Updated product ${product.id}: ${product.name}`);
      }
    }
    
    console.log('Image URLs fixed successfully!');
  } catch (error) {
    console.error('Error fixing images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixProductImages();