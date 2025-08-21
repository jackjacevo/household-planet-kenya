const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testPhase2APIs() {
  console.log('🧪 Testing Phase 2 APIs...\n');

  try {
    // Test 1: Get all categories
    console.log('1. Testing GET /categories');
    const categoriesResponse = await axios.get(`${BASE_URL}/categories`);
    console.log(`✅ Categories found: ${categoriesResponse.data.length}`);
    
    // Test 2: Get category hierarchy
    console.log('\n2. Testing GET /categories/hierarchy');
    const hierarchyResponse = await axios.get(`${BASE_URL}/categories/hierarchy`);
    console.log(`✅ Parent categories: ${hierarchyResponse.data.length}`);
    
    // Test 3: Get all products
    console.log('\n3. Testing GET /products');
    const productsResponse = await axios.get(`${BASE_URL}/products`);
    console.log(`✅ Products found: ${productsResponse.data.products.length}`);
    console.log(`   Pagination: Page ${productsResponse.data.pagination.page} of ${productsResponse.data.pagination.pages}`);
    
    // Test 4: Get featured products
    console.log('\n4. Testing GET /products/featured');
    const featuredResponse = await axios.get(`${BASE_URL}/products/featured`);
    console.log(`✅ Featured products: ${featuredResponse.data.length}`);
    
    // Test 5: Search products
    console.log('\n5. Testing GET /products/search?q=kitchen');
    const searchResponse = await axios.get(`${BASE_URL}/products/search?q=kitchen`);
    console.log(`✅ Search results: ${searchResponse.data.length}`);
    
    // Test 6: Get products by category
    console.log('\n6. Testing GET /products?category=kitchen-dining');
    const categoryProductsResponse = await axios.get(`${BASE_URL}/products?category=kitchen-dining`);
    console.log(`✅ Kitchen & Dining products: ${categoryProductsResponse.data.products.length}`);
    
    console.log('\n🎉 All Phase 2 APIs are working correctly!');
    console.log('\n📊 Summary:');
    console.log(`   - Categories: ${categoriesResponse.data.length}`);
    console.log(`   - Products: ${productsResponse.data.products.length}`);
    console.log(`   - Featured: ${featuredResponse.data.length}`);
    console.log(`   - Search results: ${searchResponse.data.length}`);
    
  } catch (error) {
    console.error('❌ Error testing APIs:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Run the test
testPhase2APIs();