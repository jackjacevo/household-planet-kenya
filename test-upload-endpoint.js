const axios = require('axios');

async function testUploadEndpoint() {
  try {
    // Test if the endpoint exists by making an OPTIONS request
    const response = await axios.options('https://api.householdplanetkenya.co.ke/api/upload/category', {
      timeout: 5000
    });
    
    console.log('✅ Upload endpoint exists');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Endpoint responded with error:');
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
      
      if (error.response.status === 401) {
        console.log('🔐 Authentication required - this is expected for upload endpoints');
      }
    } else if (error.code === 'ECONNREFUSED') {
      console.log('❌ Backend server is not running');
    } else {
      console.log('❌ Network error:', error.message);
    }
  }
}

testUploadEndpoint();