const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testEndpoints() {
  console.log('Testing API endpoints...\n');

  try {
    // Test categories endpoint
    console.log('1. Testing Categories endpoint...');
    const categoriesResponse = await axios.get(`${API_BASE_URL}/categories`);
    console.log('✅ Categories endpoint working');
    console.log(`   Found ${categoriesResponse.data.length} categories`);
    console.log(`   Sample category: ${categoriesResponse.data[0]?.name || 'None'}\n`);
  } catch (error) {
    console.log('❌ Categories endpoint failed');
    console.log(`   Error: ${error.message}\n`);
  }

  try {
    // Test products endpoint
    console.log('2. Testing Products endpoint...');
    const productsResponse = await axios.get(`${API_BASE_URL}/products`);
    console.log('✅ Products endpoint working');
    console.log(`   Found ${productsResponse.data.products?.length || 0} products`);
    console.log(`   Total pages: ${productsResponse.data.pagination?.totalPages || 0}\n`);
  } catch (error) {
    console.log('❌ Products endpoint failed');
    console.log(`   Error: ${error.message}\n`);
  }

  try {
    // Test health check
    console.log('3. Testing server health...');
    const healthResponse = await axios.get(`http://localhost:3001`);
    console.log('✅ Server is running\n');
  } catch (error) {
    console.log('❌ Server is not responding');
    console.log(`   Error: ${error.message}\n`);
  }
}

testEndpoints().catch(console.error);