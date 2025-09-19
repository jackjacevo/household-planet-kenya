const fetch = require('node-fetch');

async function testLocalCORS() {
  console.log('Testing local CORS configuration...');
  
  try {
    // Test local backend
    const response = await fetch('http://localhost:3001/health', {
      method: 'GET',
      headers: {
        'Origin': 'https://householdplanetkenya.co.ke',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Local backend status:', response.status);
    console.log('CORS headers:', Object.fromEntries(response.headers));
    
    if (response.ok) {
      const data = await response.json();
      console.log('Response:', data);
      console.log('✅ Local CORS configuration working');
    }
    
  } catch (error) {
    console.log('❌ Local backend not running:', error.message);
    console.log('Start backend with: npm run start:dev');
  }
}

testLocalCORS();