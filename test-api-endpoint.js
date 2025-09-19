const https = require('https');

const testEndpoint = (path, description) => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.householdplanetkenya.co.ke',
      port: 443,
      path: path,
      method: 'GET',
      headers: {
        'Origin': 'https://householdplanetkenya.co.ke',
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`\n${description}:`);
        console.log(`Status: ${res.statusCode}`);
        if (res.statusCode !== 200) {
          console.log(`Error: ${data}`);
        } else {
          console.log('✅ Success');
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      console.log(`\n${description}:`);
      console.log(`❌ Error: ${e.message}`);
      resolve();
    });

    req.end();
  });
};

const runTests = async () => {
  console.log('Testing API endpoints...');
  
  await testEndpoint('/api/products?limit=6&featured=true', 'Featured products');
  await testEndpoint('/api/products?limit=6&sortBy=newest', 'Newest products');
  await testEndpoint('/api/products?limit=6&sortBy=createdAt&sortOrder=desc', 'Products by creation date');
  await testEndpoint('/api/products', 'Basic products endpoint');
  await testEndpoint('/health', 'Health check');
};

runTests();