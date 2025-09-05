const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function testRecentlyViewed() {
  try {
    console.log('Testing Recently Viewed API...');
    
    // Test the recently-viewed endpoint
    const response = await axios.get(`${API_BASE}/products/recently-viewed?limit=6`);
    
    console.log('✅ API Response Status:', response.status);
    console.log('✅ API Response Data:', JSON.stringify(response.data, null, 2));
    
    if (Array.isArray(response.data)) {
      console.log(`✅ Returned ${response.data.length} recently viewed items`);
    } else {
      console.log('⚠️  Response is not an array');
    }
    
  } catch (error) {
    if (error.response) {
      console.log('❌ API Error Status:', error.response.status);
      console.log('❌ API Error Data:', error.response.data);
    } else {
      console.log('❌ Network Error:', error.message);
    }
  }
}

async function testProductEndpoint() {
  try {
    console.log('\nTesting Products endpoint...');
    
    // Test the products endpoint to make sure basic API is working
    const response = await axios.get(`${API_BASE}/products?limit=1`);
    
    console.log('✅ Products API Status:', response.status);
    console.log('✅ Products API working');
    
  } catch (error) {
    console.log('❌ Products API Error:', error.message);
  }
}

// Run tests
async function runTests() {
  await testProductEndpoint();
  await testRecentlyViewed();
}

runTests();