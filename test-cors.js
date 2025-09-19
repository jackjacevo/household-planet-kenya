const fetch = require('node-fetch');

async function testCORS() {
  console.log('Testing CORS configuration...');
  
  try {
    // Test health endpoint
    const healthResponse = await fetch('https://api.householdplanetkenya.co.ke/health', {
      method: 'GET',
      headers: {
        'Origin': 'https://householdplanetkenya.co.ke',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Health endpoint status:', healthResponse.status);
    console.log('Health endpoint headers:', Object.fromEntries(healthResponse.headers));
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('Health data:', healthData);
    }
    
    // Test CORS endpoint
    const corsResponse = await fetch('https://api.householdplanetkenya.co.ke/cors-test', {
      method: 'GET',
      headers: {
        'Origin': 'https://householdplanetkenya.co.ke',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('CORS test status:', corsResponse.status);
    console.log('CORS test headers:', Object.fromEntries(corsResponse.headers));
    
    if (corsResponse.ok) {
      const corsData = await corsResponse.json();
      console.log('CORS data:', corsData);
    }
    
    // Test products endpoint
    const productsResponse = await fetch('https://api.householdplanetkenya.co.ke/api/products?limit=1', {
      method: 'GET',
      headers: {
        'Origin': 'https://householdplanetkenya.co.ke',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Products endpoint status:', productsResponse.status);
    console.log('Products endpoint headers:', Object.fromEntries(productsResponse.headers));
    
  } catch (error) {
    console.error('CORS test failed:', error.message);
  }
}

testCORS();