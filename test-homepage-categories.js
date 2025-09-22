const axios = require('axios');

async function testHomepageCategories() {
  try {
    console.log('Testing homepage categories fetch...\n');
    
    // Test the categories API endpoint
    const response = await axios.get('https://api.householdplanetkenya.co.ke/api/categories');
    const categories = response.data;
    
    console.log(`✅ Categories API: ${categories.length} total categories`);
    
    // Filter main categories (no parentId)
    const mainCategories = categories.filter(cat => !cat.parentId && cat.isActive);
    console.log(`✅ Main categories: ${mainCategories.length} found`);
    
    // Show first 6 (what homepage shows)
    const featuredCategories = mainCategories.slice(0, 6);
    console.log(`✅ Featured categories (homepage): ${featuredCategories.length}\n`);
    
    // Display category details
    featuredCategories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name}`);
      console.log(`   Slug: ${cat.slug}`);
      console.log(`   Image: ${cat.image ? '✅ Has image' : '❌ No image'}`);
      console.log(`   Products: ${cat._count?.products || 0}`);
      console.log('');
    });
    
    // Check if images are accessible
    console.log('Testing category images...');
    for (const cat of featuredCategories.slice(0, 3)) {
      if (cat.image) {
        try {
          const imgResponse = await axios.head(cat.image, { timeout: 5000 });
          console.log(`✅ ${cat.name} image accessible (${imgResponse.status})`);
        } catch (error) {
          console.log(`❌ ${cat.name} image not accessible`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testHomepageCategories();