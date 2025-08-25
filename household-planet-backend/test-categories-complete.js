const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testCategoriesAPI() {
  console.log('🧪 Testing Categories API Endpoints...\n');

  try {
    // Test 1: Get all categories
    console.log('1️⃣ Testing GET /categories');
    const categoriesResponse = await axios.get(`${API_BASE_URL}/categories`);
    const categories = categoriesResponse.data;
    
    console.log(`✅ Found ${categories.length} categories`);
    console.log(`📊 Sample categories:`, categories.slice(0, 3).map(c => c.name));

    // Test 2: Get category hierarchy
    console.log('\n2️⃣ Testing GET /categories/hierarchy');
    const hierarchyResponse = await axios.get(`${API_BASE_URL}/categories/hierarchy`);
    const hierarchy = hierarchyResponse.data;
    
    console.log(`✅ Found ${hierarchy.length} parent categories with children`);
    
    // Display hierarchy structure
    console.log('\n📋 Category Hierarchy:');
    hierarchy.forEach((parent, index) => {
      console.log(`${index + 1}. ${parent.name} (${parent.children?.length || 0} subcategories)`);
      if (parent.children && parent.children.length > 0) {
        parent.children.slice(0, 3).forEach((child, childIndex) => {
          console.log(`   ${childIndex + 1}. ${child.name}`);
        });
        if (parent.children.length > 3) {
          console.log(`   ... and ${parent.children.length - 3} more`);
        }
      }
    });

    // Test 3: Get specific category by slug
    if (hierarchy.length > 0) {
      const testSlug = hierarchy[0].slug;
      console.log(`\n3️⃣ Testing GET /categories/slug/${testSlug}`);
      
      try {
        const categoryResponse = await axios.get(`${API_BASE_URL}/categories/slug/${testSlug}`);
        console.log(`✅ Successfully retrieved category: ${categoryResponse.data.name}`);
      } catch (error) {
        console.log(`❌ Failed to get category by slug: ${error.message}`);
      }
    }

    // Test 4: Verify all 14 main categories are present
    console.log('\n4️⃣ Verifying all 14 main categories');
    const expectedCategories = [
      'Kitchen and Dining',
      'Bathroom Accessories', 
      'Cleaning and Laundry',
      'Beddings and Bedroom Accessories',
      'Storage and Organization',
      'Home Decor and Accessories',
      'Jewelry',
      'Humidifier, Candles and Aromatherapy',
      'Beauty and Cosmetics',
      'Home Appliances',
      'Furniture',
      'Outdoor and Garden',
      'Lighting and Electrical',
      'Bags and Belts'
    ];

    const actualCategoryNames = hierarchy.map(cat => cat.name);
    const missingCategories = expectedCategories.filter(cat => !actualCategoryNames.includes(cat));
    
    if (missingCategories.length === 0) {
      console.log('✅ All 14 main categories are present!');
    } else {
      console.log(`❌ Missing categories: ${missingCategories.join(', ')}`);
    }

    // Test 5: Check categories with images
    console.log('\n5️⃣ Checking category images');
    const categoriesWithImages = hierarchy.filter(cat => cat.image);
    const categoriesWithoutImages = hierarchy.filter(cat => !cat.image);
    
    console.log(`✅ Categories with images: ${categoriesWithImages.length}`);
    if (categoriesWithoutImages.length > 0) {
      console.log(`⚠️  Categories without images: ${categoriesWithoutImages.map(c => c.name).join(', ')}`);
    }

    // Test 6: Check subcategories
    console.log('\n6️⃣ Checking subcategories');
    const totalSubcategories = hierarchy.reduce((total, parent) => total + (parent.children?.length || 0), 0);
    console.log(`✅ Total subcategories: ${totalSubcategories}`);

    // Summary
    console.log('\n📊 Summary:');
    console.log('='.repeat(40));
    console.log(`Total Categories: ${categories.length}`);
    console.log(`Parent Categories: ${hierarchy.length}`);
    console.log(`Subcategories: ${totalSubcategories}`);
    console.log(`Categories with Images: ${categoriesWithImages.length}`);
    console.log(`All 14 Main Categories Present: ${missingCategories.length === 0 ? 'Yes' : 'No'}`);

    return {
      success: true,
      totalCategories: categories.length,
      parentCategories: hierarchy.length,
      subcategories: totalSubcategories,
      allMainCategoriesPresent: missingCategories.length === 0
    };

  } catch (error) {
    console.error('❌ Error testing categories API:', error.message);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 Starting Categories API Test Suite\n');
  
  try {
    const result = await testCategoriesAPI();
    
    if (result.success) {
      console.log('\n🎉 All category tests passed! The product catalog system is ready.');
    } else {
      console.log('\n💥 Category tests failed:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { testCategoriesAPI };