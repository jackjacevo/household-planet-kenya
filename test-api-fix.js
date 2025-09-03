const axios = require('axios');

async function testAPI() {
  const baseURL = 'http://localhost:3001';
  
  console.log('Testing API endpoints...\n');
  
  try {
    // Test products endpoint
    console.log('1. Testing /api/products...');
    const productsResponse = await axios.get(`${baseURL}/api/products?limit=5`);
    console.log('✅ Products endpoint working');
    console.log(`   Found ${productsResponse.data.data?.length || 0} products\n`);
    
    // Test categories endpoint
    console.log('2. Testing /api/categories...');
    const categoriesResponse = await axios.get(`${baseURL}/api/categories`);
    console.log('✅ Categories endpoint working');
    console.log(`   Found ${categoriesResponse.data?.length || 0} categories\n`);
    
    // Test featured products
    console.log('3. Testing /api/products with featured filter...');
    const featuredResponse = await axios.get(`${baseURL}/api/products?featured=true&limit=5`);
    console.log('✅ Featured products endpoint working');
    console.log(`   Found ${featuredResponse.data.data?.length || 0} featured products\n`);
    
    console.log('🎉 All API endpoints are working correctly!');
    
  } catch (error) {
    console.error('❌ API test failed:');
    console.error('Error:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('URL:', error.config?.url);
  }
}

testAPI();