const { PrismaClient } = require('@prisma/client');

async function fixProductImages() {
  const prisma = new PrismaClient();
  
  try {
    // Get the uploaded image files
    const uploadedImages = [
      '/uploads/products/7-1756225149806-226896697.webp',
      '/uploads/products/7-1756225149815-711541015.webp', 
      '/uploads/products/7-1756225170112-697418242.webp',
      '/uploads/products/8-1755818509375-249154329.webp'
    ];
    
    // Update the product to include the actual uploaded images
    const result = await prisma.product.update({
      where: { id: 1 },
      data: {
        images: JSON.stringify(uploadedImages)
      }
    });
    
    console.log('Updated product images:', result.images);
    console.log('Parsed images:', JSON.parse(result.images));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixProductImages();