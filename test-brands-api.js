const axios = require('axios');

async function testBrandsAPI() {
  const apiUrl = 'https://api.householdplanetkenya.co.ke';
  
  try {
    console.log('Testing brands API...');
    
    // Test GET /api/products/brands
    const response = await axios.get(`${apiUrl}/api/products/brands`, {
      timeout: 10000
    });
    
    console.log('✅ Brands API working!');
    console.log('Response status:', response.status);
    console.log('Brands found:', response.data.length);
    console.log('Sample brands:', response.data.slice(0, 3));
    
  } catch (error) {
    console.log('❌ Brands API failed:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testBrandsAPI();