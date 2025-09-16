const fetch = require('node-fetch');

async function testDeleteRoute() {
  try {
    const response = await fetch('http://localhost:3001/api/orders/17', {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer your-token-here',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    if (response.status === 404) {
      console.log('Route not found - server may need restart');
    }
    
    const text = await response.text();
    console.log('Response:', text);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testDeleteRoute();