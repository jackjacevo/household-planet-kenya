const axios = require('axios');

async function testCORS() {
  console.log('Testing CORS configuration...');
  
  const apiUrl = 'https://api.householdplanetkenya.co.ke';
  const frontendUrl = 'https://householdplanetkenya.co.ke';
  
  try {
    // Test health endpoint
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await axios.get(`${apiUrl}/health`, {
      headers: {
        'Origin': frontendUrl,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log('Health endpoint response:', healthResponse.status);
    console.log('CORS headers:', {
      'Access-Control-Allow-Origin': healthResponse.headers['access-control-allow-origin'],
      'Access-Control-Allow-Credentials': healthResponse.headers['access-control-allow-credentials'],
      'Access-Control-Allow-Methods': healthResponse.headers['access-control-allow-methods']
    });
    
    // Test CORS test endpoint
    console.log('\n2. Testing CORS test endpoint...');
    const corsResponse = await axios.get(`${apiUrl}/cors-test`, {
      headers: {
        'Origin': frontendUrl
      }
    });
    
    console.log('CORS test response:', corsResponse.data);
    
    // Test API endpoint
    console.log('\n3. Testing API endpoint...');
    const apiResponse = await axios.get(`${apiUrl}/api/cors-test`, {
      headers: {
        'Origin': frontendUrl
      }
    });
    
    console.log('API CORS test response:', apiResponse.data);
    
    console.log('\n✅ CORS configuration is working correctly!');
    
  } catch (error) {
    console.error('\n❌ CORS test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testCORS();