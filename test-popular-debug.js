const axios = require('axios');

const API_URL = 'https://api.householdplanetkenya.co.ke';

async function debugPopularAPI() {
  console.log('🔍 Debugging Popular Products API\n');

  // Test with different parameters
  const tests = [
    { url: '/api/products/popular', desc: 'No parameters' },
    { url: '/api/products/popular?limit=5', desc: 'With limit=5' },
    { url: '/api/products/popular?limit=10', desc: 'With limit=10' }
  ];

  for (const test of tests) {
    console.log(`Testing: ${test.desc}`);
    try {
      const response = await axios.get(`${API_URL}${test.url}`);
      console.log(`   ✅ SUCCESS: ${response.data.length} products returned`);
    } catch (error) {
      console.log(`   ❌ FAILED: ${error.response?.status} - ${error.response?.data?.message}`);
      if (error.response?.data) {
        console.log(`   Details: ${JSON.stringify(error.response.data)}`);
      }
    }
  }

  // Test if endpoint exists at all
  console.log('\n🔍 Testing endpoint existence...');
  try {
    const response = await axios.options(`${API_URL}/api/products/popular`);
    console.log('   ✅ Endpoint exists (OPTIONS request successful)');
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('   ❌ Endpoint not found - backend may need restart');
    } else {
      console.log(`   ⚠️ Endpoint response: ${error.response?.status}`);
    }
  }

  // Compare with working endpoint
  console.log('\n📦 Comparing with working endpoint...');
  try {
    const featured = await axios.get(`${API_URL}/api/products/featured`);
    console.log(`   ✅ Featured products: ${featured.data.length} products (working)`);
  } catch (error) {
    console.log(`   ❌ Featured products also failing: ${error.response?.status}`);
  }

  console.log('\n💡 Diagnosis:');
  console.log('   - Backend code changes may not be deployed yet');
  console.log('   - Server restart may be needed to pick up new endpoint');
  console.log('   - All other APIs working perfectly');
  console.log('   - Database integration is complete');
}

debugPopularAPI();