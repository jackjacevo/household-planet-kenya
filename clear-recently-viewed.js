const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearRecentlyViewed() {
  console.log('🧹 Clearing recently viewed records...');
  
  try {
    // Clear all recently viewed records
    const deletedCount = await prisma.recentlyViewed.deleteMany();
    console.log(`✅ Deleted ${deletedCount.count} recently viewed records`);
    
    // Also clear any product recommendations that might reference deleted products
    const deletedRecommendations = await prisma.productRecommendation.deleteMany();
    console.log(`✅ Deleted ${deletedRecommendations.count} product recommendations`);
    
    console.log('🎉 Recently viewed data cleared successfully!');
    
  } catch (error) {
    console.error('❌ Error clearing recently viewed:', error);
  }
}

clearRecentlyViewed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());