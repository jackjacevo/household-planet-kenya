const axios = require('axios');

async function testProductionBrands() {
  const apiUrl = 'https://api.householdplanetkenya.co.ke';
  
  try {
    console.log('🔍 Testing current production brands API...\n');
    
    // Test the current production endpoint
    console.log('Testing: GET /api/products/brands');
    const response = await axios.get(`${apiUrl}/api/products/brands`, {
      timeout: 10000
    });
    
    console.log('✅ Production API Response:');
    console.log(`   Status: ${response.status}`);
    console.log(`   Brands count: ${response.data.length}`);
    
    if (response.data.length > 0) {
      console.log('   Sample brand structure:');
      console.log('  ', JSON.stringify(response.data[0], null, 2));
    }
    
    // Test if the old endpoint still exists
    console.log('\n🔍 Testing old endpoint: GET /api/brands');
    try {
      const oldResponse = await axios.get(`${apiUrl}/api/brands`, {
        timeout: 5000
      });
      console.log('⚠️  Old endpoint still exists - this should be removed');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Old endpoint correctly returns 404');
      } else {
        console.log('❓ Old endpoint error:', error.response?.status || error.message);
      }
    }
    
  } catch (error) {
    console.log('❌ Production API test failed:');
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Error: ${error.response.data?.message || error.response.data}`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
  }
}

testProductionBrands();