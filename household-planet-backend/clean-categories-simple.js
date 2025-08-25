const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanCategories() {
  console.log('🧹 Cleaning up duplicate categories...\n');

  try {
    // Get all categories
    const allCategories = await prisma.category.findMany({
      select: { id: true, name: true, slug: true, parentId: true }
    });

    console.log(`Found ${allCategories.length} total categories`);

    // Find duplicates to remove (old categories that are not the main 14)
    const categoriesToDelete = allCategories.filter(cat => 
      cat.parentId === null && ['bathroom', 'home-decor', 'lighting'].includes(cat.slug)
    );

    console.log(`\nRemoving ${categoriesToDelete.length} duplicate categories:`);
    
    for (const cat of categoriesToDelete) {
      console.log(`- ${cat.name} (${cat.slug})`);
      await prisma.category.delete({ where: { id: cat.id } });
    }

    // Verify final count
    const finalCategories = await prisma.category.findMany({
      where: { parentId: null },
      select: { name: true, slug: true }
    });

    console.log(`\n✅ Final result: ${finalCategories.length} main categories`);
    finalCategories.forEach((cat, i) => {
      console.log(`${i + 1}. ${cat.name}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

async function main() {
  try {
    await cleanCategories();
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