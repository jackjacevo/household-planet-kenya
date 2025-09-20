const axios = require('axios');

async function testHomepageProducts() {
  try {
    console.log('🏠 Testing homepage products...');
    
    // Test products endpoint
    const productsResponse = await axios.get('https://api.householdplanetkenya.co.ke/api/products');
    console.log(`✅ Found ${productsResponse.data.products?.length || 0} products`);
    
    // Test categories endpoint
    const categoriesResponse = await axios.get('https://api.householdplanetkenya.co.ke/api/categories');
    console.log(`✅ Found ${categoriesResponse.data?.length || 0} categories`);
    
    // Test featured products
    const featuredResponse = await axios.get('https://api.householdplanetkenya.co.ke/api/products?featured=true');
    console.log(`✅ Found ${featuredResponse.data.products?.length || 0} featured products`);
    
    if (productsResponse.data.products?.length > 0) {
      console.log('\n📦 Sample products:');
      productsResponse.data.products.slice(0, 3).forEach(product => {
        console.log(`- ${product.name} - KSh ${product.price}`);
      });
    }
    
    console.log('\n🎉 Homepage should now show products and categories!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testHomepageProducts();