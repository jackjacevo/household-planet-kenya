const axios = require('axios');

async function testImageResponse() {
  try {
    const response = await axios.get('http://localhost:3001/api/admin/products?page=1&limit=1', {
      headers: { 
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AaG91c2Vob2xkcGxhbmV0LmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTczNjk2NzI5NCwiZXhwIjoxNzM3NTcyMDk0fQ.YhBJBJhYJhqGJhqGJhqGJhqGJhqGJhqGJhqGJhqGJhqG'
      }
    });
    
    console.log('API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.data && response.data.data[0]) {
      console.log('\nFirst product images:');
      console.log(response.data.data[0].images);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testImageResponse();