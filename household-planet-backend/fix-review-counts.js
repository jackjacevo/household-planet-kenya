const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixReviewCounts() {
  try {
    console.log('🔄 Recalculating product review counts...');
    
    // Get all products
    const products = await prisma.product.findMany({
      select: { id: true, name: true }
    });
    
    console.log(`📊 Found ${products.length} products to update`);
    
    for (const product of products) {
      // Count actual reviews for this product
      const reviewCount = await prisma.review.count({
        where: { productId: product.id }
      });
      
      // Calculate average rating
      const reviews = await prisma.review.findMany({
        where: { productId: product.id },
        select: { rating: true }
      });
      
      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;
      
      // Update product with correct counts
      await prisma.product.update({
        where: { id: product.id },
        data: {
          totalReviews: reviewCount,
          averageRating: averageRating
        }
      });
      
      console.log(`✅ ${product.name}: ${reviewCount} reviews, ${averageRating.toFixed(1)} avg rating`);
    }
    
    console.log('🎉 Review counts updated successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing review counts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixReviewCounts();