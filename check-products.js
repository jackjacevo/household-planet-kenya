const https = require('https');

const checkProducts = () => {
  const options = {
    hostname: 'api.householdplanetkenya.co.ke',
    port: 443,
    path: '/api/products',
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
      try {
        const result = JSON.parse(data);
        console.log('Products count:', result.data?.length || 0);
        console.log('Total products:', result.pagination?.total || 0);
        
        if (result.data?.length > 0) {
          console.log('Sample product:', result.data[0].name);
        } else {
          console.log('❌ No products found in database');
        }
      } catch (e) {
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (e) => console.error('Error:', e.message));
  req.end();
};

checkProducts();