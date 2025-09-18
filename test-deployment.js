#!/usr/bin/env node

const https = require('https');
const http = require('http');

const tests = [
  {
    name: 'Backend Health Check',
    url: 'https://api.householdplanetkenya.co.ke/health',
    expected: 'ok'
  },
  {
    name: 'Backend CORS Test',
    url: 'https://api.householdplanetkenya.co.ke/cors-test',
    expected: 'working'
  },
  {
    name: 'Categories API',
    url: 'https://api.householdplanetkenya.co.ke/api/categories',
    expected: 'array'
  },
  {
    name: 'Products API',
    url: 'https://api.householdplanetkenya.co.ke/api/products?limit=1',
    expected: 'array'
  },
  {
    name: 'Frontend Health',
    url: 'https://householdplanetkenya.co.ke',
    expected: 'html'
  }
];

async function testEndpoint(test) {
  return new Promise((resolve) => {
    const client = test.url.startsWith('https') ? https : http;
    
    const req = client.get(test.url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = {
            name: test.name,
            status: res.statusCode,
            success: res.statusCode === 200,
            data: data.substring(0, 200)
          };
          
          if (test.expected === 'ok' && data.includes('ok')) result.success = true;
          if (test.expected === 'working' && data.includes('working')) result.success = true;
          if (test.expected === 'array' && data.startsWith('[')) result.success = true;
          if (test.expected === 'html' && data.includes('<html')) result.success = true;
          
          resolve(result);
        } catch (error) {
          resolve({
            name: test.name,
            status: res.statusCode,
            success: false,
            error: error.message
          });
        }
      });
    });
    
    req.on('error', (error) => {
      resolve({
        name: test.name,
        status: 0,
        success: false,
        error: error.message
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        name: test.name,
        status: 0,
        success: false,
        error: 'Timeout'
      });
    });
  });
}

async function runTests() {
  console.log('🧪 Testing Deployment...\n');
  
  const results = [];
  for (const test of tests) {
    console.log(`Testing: ${test.name}...`);
    const result = await testEndpoint(test);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ ${result.name} - OK`);
    } else {
      console.log(`❌ ${result.name} - FAILED (${result.status}) ${result.error || ''}`);
    }
  }
  
  console.log('\n📊 Summary:');
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  console.log(`${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Deployment is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the issues above.');
  }
}

runTests().catch(console.error);