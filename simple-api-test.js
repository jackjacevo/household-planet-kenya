const https = require('https');
const http = require('http');

function testAPI() {
  console.log('🔍 Testing Categories API Connection...\n');

  const apiUrl = 'http://localhost:3001/api/categories/hierarchy';
  
  console.log(`Testing: ${apiUrl}`);
  
  const request = http.get(apiUrl, (response) => {
    console.log(`Status Code: ${response.statusCode}`);
    console.log(`Headers:`, response.headers);
    
    let data = '';
    response.on('data', (chunk) => {
      data += chunk;
    });
    
    response.on('end', () => {
      console.log('\nResponse Body:');
      try {
        const jsonData = JSON.parse(data);
        console.log('✅ Valid JSON response');
        console.log(`Categories count: ${Array.isArray(jsonData) ? jsonData.length : 'Not an array'}`);
        if (Array.isArray(jsonData) && jsonData.length > 0) {
          console.log('First category:', JSON.stringify(jsonData[0], null, 2));
        } else {
          console.log('❌ No categories returned or invalid format');
        }
      } catch (error) {
        console.log('❌ Invalid JSON response:', data);
      }
    });
  });
  
  request.on('error', (error) => {
    console.log('❌ API Request Failed:', error.message);
    console.log('\n🔧 Troubleshooting Steps:');
    console.log('1. Check if backend server is running:');
    console.log('   cd household-planet-backend');
    console.log('   npm run start:dev');
    console.log('2. Verify server is listening on port 3001');
    console.log('3. Check for any error messages in backend console');
  });
  
  request.setTimeout(5000, () => {
    console.log('❌ Request timeout - server may not be running');
    request.destroy();
  });
}

testAPI();