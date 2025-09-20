const fetch = require('node-fetch');

async function testBackendConnection() {
  console.log('🔍 Testing Backend Connection...\n');

  const tests = [
    {
      name: 'Backend Health Check',
      url: 'https://api.householdplanetkenya.co.ke/health',
      method: 'GET'
    },
    {
      name: 'Admin Dashboard API',
      url: 'https://api.householdplanetkenya.co.ke/api/admin/dashboard',
      method: 'GET',
      headers: { 'Authorization': 'Bearer test-token' }
    },
    {
      name: 'Products API',
      url: 'https://api.householdplanetkenya.co.ke/api/products',
      method: 'GET'
    },
    {
      name: 'Delivery Locations API',
      url: 'https://api.householdplanetkenya.co.ke/simple-delivery/locations',
      method: 'GET'
    }
  ];

  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}`);
      console.log(`URL: ${test.url}`);
      
      const response = await fetch(test.url, {
        method: test.method,
        headers: test.headers || {},
        timeout: 10000
      });

      console.log(`Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.text();
        console.log(`Response: ${data.substring(0, 200)}${data.length > 200 ? '...' : ''}`);
        console.log('✅ SUCCESS\n');
      } else {
        console.log('❌ FAILED - Non-200 status\n');
      }
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}\n`);
    }
  }

  // Test CORS
  console.log('🌐 Testing CORS...');
  try {
    const response = await fetch('https://api.householdplanetkenya.co.ke/api/products', {
      method: 'OPTIONS'
    });
    console.log(`CORS Status: ${response.status}`);
    console.log(`CORS Headers: ${JSON.stringify(Object.fromEntries(response.headers))}`);
  } catch (error) {
    console.log(`CORS Error: ${error.message}`);
  }
}

testBackendConnection();