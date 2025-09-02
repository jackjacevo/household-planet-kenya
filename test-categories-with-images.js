const axios = require('axios');

async function testCategoriesWithImages() {
  try {
    console.log('🔍 Testing categories API with images...');
    
    const apiUrl = 'http://localhost:3001/api/admin/categories';
    console.log('📡 Fetching from:', apiUrl);
    
    const response = await axios.get(apiUrl);
    console.log('✅ Response status:', response.status);
    
    const categories = response.data;
    console.log('📊 Total categories found:', categories.length);
    
    // Filter parent categories only
    const parentCategories = categories.filter(cat => !cat.parentId && cat.isActive);
    console.log('👨‍👩‍👧‍👦 Parent categories:', parentCategories.length);
    
    console.log('\n📋 Category Details:');
    parentCategories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name}`);
      console.log(`   - ID: ${cat.id}`);
      console.log(`   - Slug: ${cat.slug}`);
      console.log(`   - Image: ${cat.image || 'No image'}`);
      console.log(`   - Description: ${cat.description || 'No description'}`);
      console.log(`   - Children: ${cat.children?.length || 0}`);
      console.log(`   - Products: ${cat._count?.products || 0}`);
      console.log(`   - Active: ${cat.isActive}`);
      console.log('');
    });
    
    // Test image URLs
    console.log('\n🖼️  Testing image URLs:');
    for (const cat of parentCategories.slice(0, 3)) { // Test first 3
      if (cat.image) {
        try {
          const imageResponse = await axios.head(cat.image);
          console.log(`✅ ${cat.name}: Image accessible (${imageResponse.status})`);
        } catch (error) {
          console.log(`❌ ${cat.name}: Image not accessible - ${error.message}`);
        }
      } else {
        console.log(`⚠️  ${cat.name}: No image URL`);
      }
    }
    
    console.log('\n🎯 Summary:');
    console.log(`- Total categories: ${categories.length}`);
    console.log(`- Parent categories: ${parentCategories.length}`);
    console.log(`- Categories with images: ${parentCategories.filter(cat => cat.image).length}`);
    console.log(`- Categories without images: ${parentCategories.filter(cat => !cat.image).length}`);
    
  } catch (error) {
    console.error('❌ Error testing categories:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testCategoriesWithImages();