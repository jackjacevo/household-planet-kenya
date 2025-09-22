const axios = require('axios');

async function testProductUploadEndpoints() {
  const endpoints = [
    '/api/upload/product',
    '/api/upload/products', 
    '/api/product/upload',
    '/api/admin/products/temp/images'
  ];
  
  for (const endpoint of endpoints) {
    const url = `https://api.householdplanetkenya.co.ke${endpoint}`;
    try {
      const response = await axios.options(url, { timeout: 5000 });
      console.log(`✅ ${endpoint} - Status: ${response.status}`);
      
      // Test POST
      try {
        await axios.post(url, {}, { timeout: 5000 });
      } catch (postError) {
        const status = postError.response?.status;
        console.log(`   POST: ${status} ${status === 401 ? '(Auth required - exists)' : status === 404 ? '(Not found)' : ''}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - ${error.response?.status || 'Network error'}`);
    }
  }
}

testProductUploadEndpoints();