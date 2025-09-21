const https = require('https');

const API_BASE = 'https://api.householdplanetkenya.co.ke';

// Test endpoints
const endpoints = [
  '/api/products',
  '/api/categories', 
  '/api/products/brands',
  '/api/promo-codes',
  '/api/analytics/dashboard',
  '/health',
  '/api/health'
];

async function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const url = `${API_BASE}${endpoint}`;
    console.log(`Testing: ${url}`);
    
    const options = {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'API-Test/1.0'
      },
      timeout: 10000
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`✅ ${endpoint}: ${res.statusCode} ${res.statusMessage}`);
        if (res.statusCode >= 400) {
          console.log(`   Response: ${data.substring(0, 200)}...`);
        }
        resolve({
          endpoint,
          status: res.statusCode,
          success: res.statusCode < 400,
          response: data.substring(0, 200)
        });
      });
    });

    req.on('error', (error) => {
      console.log(`❌ ${endpoint}: ${error.message}`);
      resolve({
        endpoint,
        status: 0,
        success: false,
        error: error.message
      });
    });

    req.on('timeout', () => {
      console.log(`⏰ ${endpoint}: Timeout`);
      req.destroy();
      resolve({
        endpoint,
        status: 0,
        success: false,
        error: 'Timeout'
      });
    });

    req.setTimeout(10000);
    req.end();
  });
}

async function runTests() {
  console.log('🔍 Testing API endpoints...\n');
  
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    console.log(''); // Add spacing
  }
  
  console.log('\n📊 Summary:');
  console.log('='.repeat(50));
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.endpoint}: ${result.status || 'ERROR'}`);
    if (!result.success && result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  const failedEndpoints = results.filter(r => !r.success);
  if (failedEndpoints.length > 0) {
    console.log(`\n🚨 ${failedEndpoints.length} endpoints failed`);
    console.log('Failed endpoints:', failedEndpoints.map(r => r.endpoint).join(', '));
  } else {
    console.log('\n🎉 All endpoints are working!');
  }
}

runTests().catch(console.error);