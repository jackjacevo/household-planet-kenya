const fetch = require('node-fetch');

async function diagnose() {
  const tests = [
    'https://api.householdplanetkenya.co.ke/health',
    'https://api.householdplanetkenya.co.ke/api/health',
    'https://api.householdplanetkenya.co.ke/api/categories',
    'https://householdplanetkenya.co.ke/api/health'
  ];
  
  for (const url of tests) {
    try {
      console.log(`Testing: ${url}`);
      const response = await fetch(url, { timeout: 5000 });
      console.log(`✅ Status: ${response.status}`);
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
}

diagnose();