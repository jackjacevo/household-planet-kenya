const axios = require('axios');

async function testCustomerReviewsDisplay() {
  try {
    console.log('Testing Customer Reviews display...');
    
    const baseURL = 'http://localhost:3001';
    
    // Get products with reviews
    console.log('1. Getting products...');
    const productsResponse = await axios.get(`${baseURL}/api/products`);
    const products = productsResponse.data.data;
    
    console.log(`Found ${products.length} products`);
    
    // Check reviews for each product
    for (const product of products.slice(0, 3)) {
      console.log(`\n2. Checking reviews for: ${product.name} (ID: ${product.id})`);
      
      try {
        const reviewsResponse = await axios.get(`${baseURL}/api/reviews/product/${product.id}`);
        const reviews = reviewsResponse.data.data;
        
        console.log(`   Reviews found: ${reviews.length}`);
        
        if (reviews.length > 0) {
          console.log('   Review details:');
          reviews.forEach((review, index) => {
            console.log(`   ${index + 1}. User: ${review.user.name}`);
            console.log(`      Rating: ${review.rating}/5 stars`);
            console.log(`      Title: ${review.title || 'No title'}`);
            console.log(`      Comment: ${review.comment ? review.comment.substring(0, 50) + '...' : 'No comment'}`);
            console.log(`      Verified: ${review.isVerified ? 'Yes' : 'No'}`);
            console.log(`      Date: ${new Date(review.createdAt).toLocaleDateString()}`);
            console.log('');
          });
        } else {
          console.log('   No reviews found for this product');
        }
        
      } catch (error) {
        console.log(`   Error getting reviews: ${error.response?.data?.message || error.message}`);
      }
    }
    
    // Test the reviews API structure
    console.log('\n3. Testing reviews API structure...');
    const allReviewsResponse = await axios.get(`${baseURL}/api/reviews`);
    const allReviews = allReviewsResponse.data;
    
    console.log('API Response structure:');
    console.log(`- Total reviews: ${allReviews.data.length}`);
    console.log(`- Has pagination: ${allReviews.meta ? 'Yes' : 'No'}`);
    
    if (allReviews.data.length > 0) {
      const sampleReview = allReviews.data[0];
      console.log('Sample review structure:');
      console.log(`- ID: ${sampleReview.id}`);
      console.log(`- Product ID: ${sampleReview.productId}`);
      console.log(`- User ID: ${sampleReview.userId}`);
      console.log(`- Rating: ${sampleReview.rating}`);
      console.log(`- Has user info: ${sampleReview.user ? 'Yes' : 'No'}`);
      console.log(`- Has product info: ${sampleReview.product ? 'Yes' : 'No'}`);
      console.log(`- Created at: ${sampleReview.createdAt}`);
    }
    
    console.log('\n✅ Customer Reviews display test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testCustomerReviewsDisplay();