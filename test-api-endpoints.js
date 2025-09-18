const https = require('https');

console.log('🧪 Testing API endpoints...\n');

async function testAPI(endpoint, name) {
  return new Promise((resolve) => {
    const req = https.get(`https://householdplanetkenya.co.ke${endpoint}`, { timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`✅ ${name}: ${res.statusCode} - ${data.substring(0, 100)}...`);
        resolve(true);
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${name}: ${err.message}`);
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log(`⏰ ${name}: Timeout`);
      req.destroy();
      resolve(false);
    });
  });
}

async function runTests() {
  await testAPI('/api/categories', 'Categories API');
  await testAPI('/api/products?limit=3', 'Products API');
  await testAPI('/api/products?featured=true&limit=3', 'Featured Products');
  await testAPI('/api/delivery/locations', 'Delivery Locations');
  await testAPI('/api/content/banners', 'Banners API');
}

runTests();