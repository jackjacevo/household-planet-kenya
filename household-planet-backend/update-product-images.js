const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateProductImages() {
  try {
    // Get all products with their categories
    const products = await prisma.product.findMany({
      include: {
        category: true
      }
    });

    for (const product of products) {
      let imagePath = '/images/products/placeholder.svg'; // default
      
      // Use category-specific placeholders
      if (product.category) {
        if (product.category.name.toLowerCase().includes('kitchen')) {
          imagePath = '/images/products/kitchen-placeholder.svg';
        } else if (product.category.name.toLowerCase().includes('bathroom')) {
          imagePath = '/images/products/bathroom-placeholder.svg';
        }
      }

      await prisma.product.update({
        where: { id: product.id },
        data: {
          images: JSON.stringify([imagePath])
        }
      });

      console.log(`Updated ${product.name} with image: ${imagePath}`);
    }

    console.log('Product images updated successfully!');
  } catch (error) {
    console.error('Error updating product images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateProductImages();