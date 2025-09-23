const http = require('http');
const https = require('https');

console.log('🔍 Diagnosing Household Planet Kenya Deployment...\n');

// Test functions
async function testEndpoint(url, name) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { timeout: 5000 }, (res) => {
      console.log(`✅ ${name}: ${res.statusCode} ${res.statusMessage}`);
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${name}: ${err.message}`);
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log(`⏰ ${name}: Request timeout`);
      req.destroy();
      resolve(false);
    });
  });
}

async function runDiagnostics() {
  console.log('Testing endpoints...\n');
  
  // Test main site
  await testEndpoint('https://householdplanetkenya.co.ke', 'Main Site');
  await testEndpoint('https://householdplanetkenya.co.ke/health', 'Health Check');
  
  // Test API endpoints through proxy
  await testEndpoint('https://householdplanetkenya.co.ke/api/health', 'API Health (Proxy)');
  await testEndpoint('https://householdplanetkenya.co.ke/api/categories', 'Categories API');
  await testEndpoint('https://householdplanetkenya.co.ke/api/products', 'Products API');
  
  console.log('\n🔧 If any tests fail, check:');
  console.log('1. Docker containers are running: docker ps');
  console.log('2. Backend logs: docker logs <backend-container-id>');
  console.log('3. Frontend logs: docker logs <frontend-container-id>');
  console.log('4. Network connectivity between containers');
  console.log('5. Environment variables are set correctly');
}

runDiagnostics();