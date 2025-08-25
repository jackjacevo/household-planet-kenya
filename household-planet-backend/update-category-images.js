const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const categoryImages = {
  'kitchen-dining': 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'bathroom-accessories': 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'cleaning-laundry': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'beddings-bedroom': 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'storage-organization': 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'home-decor-accessories': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'jewelry': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'humidifier-candles-aromatherapy': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'beauty-cosmetics': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'home-appliances': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'furniture': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'outdoor-garden': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'lighting-electrical': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'bags-belts': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
};

async function updateCategoryImages() {
  console.log('🖼️  Updating category images...\n');

  try {
    let updatedCount = 0;

    for (const [slug, imageUrl] of Object.entries(categoryImages)) {
      const result = await prisma.category.updateMany({
        where: { 
          slug: slug,
          parentId: null // Only update parent categories
        },
        data: { image: imageUrl }
      });

      if (result.count > 0) {
        console.log(`✅ Updated image for: ${slug}`);
        updatedCount += result.count;
      }
    }

    console.log(`\n🎉 Updated ${updatedCount} category images!`);

    // Display categories with their images
    const categoriesWithImages = await prisma.category.findMany({
      where: { parentId: null },
      select: { name: true, slug: true, image: true },
      orderBy: { name: 'asc' }
    });

    console.log('\n📋 Categories with images:');
    console.log('='.repeat(50));
    categoriesWithImages.forEach(cat => {
      console.log(`${cat.name}: ${cat.image ? '✅ Has image' : '❌ No image'}`);
    });

  } catch (error) {
    console.error('❌ Error updating category images:', error);
    throw error;
  }
}

async function main() {
  try {
    await updateCategoryImages();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { updateCategoryImages };