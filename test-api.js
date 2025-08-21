const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('Testing API endpoints...\n');
    
    // Test banners
    const bannersResponse = await fetch('http://localhost:3001/api/content/banners?position=HERO');
    const banners = await bannersResponse.json();
    console.log('✅ Banners API working');
    console.log(`   Found ${banners.length} banners`);
    if (banners.length > 0) {
      console.log(`   First banner image: ${banners[0].image}`);
    }
    
    // Test products
    const productsResponse = await fetch('http://localhost:3001/api/products?limit=2');
    const productsData = await productsResponse.json();
    console.log('\n✅ Products API working');
    console.log(`   Found ${productsData.products?.length || 0} products`);
    if (productsData.products && productsData.products.length > 0) {
      const firstProduct = productsData.products[0];
      console.log(`   First product: ${firstProduct.name}`);
      console.log(`   First product images: ${firstProduct.images}`);
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testAPI();