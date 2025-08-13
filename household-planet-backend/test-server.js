const axios = require('axios');

async function testServer() {
  try {
    console.log('Testing server connection...');
    
    // Test basic server response
    const response = await axios.get('http://localhost:3000');
    console.log('✅ Server is running');
    
    // Test API endpoint
    const categoriesResponse = await axios.get('http://localhost:3000/categories');
    console.log(`✅ Categories endpoint working: ${categoriesResponse.data.length} categories found`);
    
  } catch (error) {
    console.error('❌ Server test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('Server is not running. Please start it with: npm run start:dev');
    }
  }
}

testServer();