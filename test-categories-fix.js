const fetch = require('node-fetch');

async function testCategoriesAPI() {
  try {
    console.log('🔍 Testing categories API endpoints...\n');
    
    const baseUrl = 'http://localhost:3001';
    
    // Test hierarchy endpoint
    console.log('Testing /api/categories/hierarchy:');
    const hierarchyResponse = await fetch(`${baseUrl}/api/categories/hierarchy`);
    const hierarchyData = await hierarchyResponse.json();
    
    console.log(`Status: ${hierarchyResponse.status}`);
    console.log(`Total categories returned: ${hierarchyData.length}`);
    
    // Filter parent categories
    const parentCategories = hierarchyData.filter(cat => !cat.parentId);
    console.log(`Parent categories (main categories): ${parentCategories.length}`);
    
    console.log('\nParent categories:');
    parentCategories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} (${cat.slug}) - ${cat.children?.length || 0} subcategories`);
    });
    
    // Test regular categories endpoint
    console.log('\n\nTesting /api/categories:');
    const allResponse = await fetch(`${baseUrl}/api/categories`);
    const allData = await allResponse.json();
    
    console.log(`Status: ${allResponse.status}`);
    console.log(`Total categories returned: ${allData.length}`);
    
    const allParents = allData.filter(cat => !cat.parentId);
    const allChildren = allData.filter(cat => cat.parentId);
    
    console.log(`Parent categories: ${allParents.length}`);
    console.log(`Child categories: ${allChildren.length}`);
    
    console.log('\n✅ API test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testCategoriesAPI();