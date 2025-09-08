const http = require('http');

function testOrdersEndpoint() {
  console.log('🔍 Testing Orders Endpoint Directly...\n');

  // Test orders endpoint without auth (should return 401)
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/orders/my-orders',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
      
      if (res.statusCode === 401) {
        console.log('✅ Orders endpoint exists and requires authentication (as expected)');
      } else if (res.statusCode === 404) {
        console.log('❌ Orders endpoint not found - there may be a routing issue');
      } else {
        console.log(`⚠️ Unexpected status code: ${res.statusCode}`);
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ Connection failed:', error.message);
  });

  req.end();
}

testOrdersEndpoint();