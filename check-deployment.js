const https = require('https');

console.log('🔍 Checking householdplanetkenya.co.ke...\n');

const req = https.get('https://householdplanetkenya.co.ke', { timeout: 10000 }, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('\nResponse body (first 500 chars):');
    console.log(data.substring(0, 500));
  });
});

req.on('error', (err) => {
  console.log('❌ Error:', err.message);
});

req.on('timeout', () => {
  console.log('⏰ Request timeout');
  req.destroy();
});