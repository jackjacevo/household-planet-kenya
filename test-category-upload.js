const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testCategoryUpload() {
  try {
    // Test both endpoints to see which one works
    const endpoints = [
      'https://api.householdplanetkenya.co.ke/api/upload/category',
      'https://api.householdplanetkenya.co.ke/api/admin/categories/upload-image'
    ];
    
    for (const endpoint of endpoints) {
      console.log(`\nTesting endpoint: ${endpoint}`);
      
      try {
        // Test with OPTIONS first
        const optionsResponse = await axios.options(endpoint, { timeout: 5000 });
        console.log(`✅ OPTIONS ${endpoint} - Status: ${optionsResponse.status}`);
        
        // Test with POST (without auth to see the error)
        try {
          const formData = new FormData();
          formData.append('file', 'test'); // dummy data
          
          const postResponse = await axios.post(endpoint, formData, {
            headers: formData.getHeaders(),
            timeout: 5000
          });
          console.log(`✅ POST ${endpoint} - Status: ${postResponse.status}`);
        } catch (postError) {
          if (postError.response) {
            console.log(`📝 POST ${endpoint} - Status: ${postError.response.status} (${postError.response.statusText})`);
            if (postError.response.status === 401) {
              console.log('   → Authentication required (expected)');
            } else if (postError.response.status === 404) {
              console.log('   → Endpoint not found');
            }
          } else {
            console.log(`❌ POST ${endpoint} - Network error: ${postError.message}`);
          }
        }
        
      } catch (error) {
        if (error.response) {
          console.log(`❌ ${endpoint} - Status: ${error.response.status}`);
        } else {
          console.log(`❌ ${endpoint} - Error: ${error.message}`);
        }
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testCategoryUpload();