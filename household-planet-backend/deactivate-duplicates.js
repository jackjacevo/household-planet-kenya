const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deactivateDuplicates() {
  console.log('🔧 Deactivating duplicate categories...\n');

  try {
    // Deactivate the old duplicate categories
    const result = await prisma.category.updateMany({
      where: {
        slug: { in: ['bathroom', 'home-decor', 'lighting'] },
        parentId: null
      },
      data: { isActive: false }
    });

    console.log(`✅ Deactivated ${result.count} duplicate categories`);

    // Verify active main categories
    const activeCategories = await prisma.category.findMany({
      where: { parentId: null, isActive: true },
      select: { name: true, slug: true },
      orderBy: { name: 'asc' }
    });

    console.log(`\n📊 Active main categories: ${activeCategories.length}`);
    activeCategories.forEach((cat, i) => {
      console.log(`${i + 1}. ${cat.name}`);
    });

    if (activeCategories.length === 14) {
      console.log('\n🎉 Perfect! Exactly 14 main categories are now active.');
    } else {
      console.log(`\n⚠️  Expected 14, but found ${activeCategories.length} active categories.`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

async function main() {
  try {
    await deactivateDuplicates();
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