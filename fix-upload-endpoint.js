const axios = require('axios');

async function testUploadEndpoints() {
  console.log('Testing upload endpoints after fix...\n');
  
  const endpoints = [
    '/api/upload/category',
    '/api/upload/category-image', 
    '/api/admin/categories/upload-image'
  ];
  
  for (const endpoint of endpoints) {
    const fullUrl = `https://api.householdplanetkenya.co.ke${endpoint}`;
    console.log(`Testing: ${fullUrl}`);
    
    try {
      // Test OPTIONS
      const optionsResponse = await axios.options(fullUrl, { timeout: 5000 });
      console.log(`  ✅ OPTIONS: ${optionsResponse.status}`);
      
      // Test POST without auth (should get 401, not 404)
      try {
        const postResponse = await axios.post(fullUrl, {}, { timeout: 5000 });
        console.log(`  ✅ POST: ${postResponse.status}`);
      } catch (postError) {
        if (postError.response) {
          const status = postError.response.status;
          if (status === 401) {
            console.log(`  ✅ POST: ${status} (Auth required - endpoint exists)`);
          } else if (status === 404) {
            console.log(`  ❌ POST: ${status} (Endpoint not found)`);
          } else {
            console.log(`  📝 POST: ${status} (${postError.response.statusText})`);
          }
        } else {
          console.log(`  ❌ POST: Network error`);
        }
      }
    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`);
    }
    console.log('');
  }
}

testUploadEndpoints();