// Verify CORS fix
const https = require('https');

const testCORS = () => {
  const options = {
    hostname: 'api.householdplanetkenya.co.ke',
    port: 443,
    path: '/api/products?limit=6&featured=true',
    method: 'GET',
    headers: {
      'Origin': 'https://householdplanetkenya.co.ke',
      'Content-Type': 'application/json'
    }
  };

  const req = https.request(options, (res) => {
    console.log('Status:', res.statusCode);
    console.log('Headers:');
    Object.keys(res.headers).forEach(key => {
      if (key.toLowerCase().includes('cors') || key.toLowerCase().includes('access-control')) {
        console.log(`  ${key}: ${res.headers[key]}`);
      }
    });

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('✅ CORS test successful');
        try {
          const parsed = JSON.parse(data);
          console.log('Data received:', parsed.length ? `${parsed.length} items` : 'No items');
        } catch (e) {
          console.log('Response data:', data.substring(0, 200) + '...');
        }
      } else {
        console.log('❌ CORS test failed');
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Request failed:', e.message);
  });

  req.end();
};

console.log('Testing CORS configuration...');
testCORS();