const axios = require('axios');

// Test configuration for single domain proxy setup
const DOMAIN = 'https://householdplanet.co.ke';
const LOCAL_FRONTEND = 'http://localhost:3000';

async function testProxyEndpoint(baseUrl, endpoint, description) {
  try {
    console.log(`\n🔍 Testing ${description}: ${baseUrl}${endpoint}`);
    
    const response = await axios.get(`${baseUrl}${endpoint}`, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'HouseholdPlanet-Test/1.0'
      }
    });
    
    console.log(`✅ ${description} - Status: ${response.status}`);
    if (response.data) {
      if (Array.isArray(response.data)) {
        console.log(`   Response: Array with ${response.data.length} items`);
      } else if (typeof response.data === 'object') {
        console.log(`   Response: Object with keys: ${Object.keys(response.data).join(', ')}`);
      } else {
        console.log(`   Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
      }
    }
    return true;
  } catch (error) {
    console.log(`❌ ${description} - Error: ${error.response?.status || error.code || error.message}`);
    if (error.response?.data) {
      console.log(`   Error details: ${JSON.stringify(error.response.data).substring(0, 200)}`);
    }
    return false;
  }
}

async function testProxyConfiguration() {
  console.log('🚀 Testing Single Domain Proxy Configuration');
  console.log('=' .repeat(60));
  
  const endpoints = [
    { path: '/api/health', desc: 'Health Check' },
    { path: '/api/categories', desc: 'Categories API' },
    { path: '/api/products', desc: 'Products API' },
    { path: '/api/delivery/locations', desc: 'Delivery Locations API' },
    { path: '/api/content/faqs', desc: 'FAQs API' },
  ];
  
  // Test production domain
  console.log(`\n📡 Testing Production Domain: ${DOMAIN}`);
  let productionResults = [];
  
  for (const endpoint of endpoints) {
    const result = await testProxyEndpoint(DOMAIN, endpoint.path, `Production ${endpoint.desc}`);
    productionResults.push({ endpoint: endpoint.path, success: result });
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between requests
  }
  
  // Test local development (if available)
  console.log(`\n🏠 Testing Local Development: ${LOCAL_FRONTEND}`);
  let localResults = [];
  
  for (const endpoint of endpoints) {
    const result = await testProxyEndpoint(LOCAL_FRONTEND, endpoint.path, `Local ${endpoint.desc}`);
    localResults.push({ endpoint: endpoint.path, success: result });
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📋 PROXY CONFIGURATION TEST SUMMARY');
  console.log('=' .repeat(60));
  
  console.log(`\n🌐 Production (${DOMAIN}):`);
  productionResults.forEach(result => {
    console.log(`   ${result.success ? '✅' : '❌'} ${result.endpoint}`);
  });
  
  console.log(`\n🏠 Local Development (${LOCAL_FRONTEND}):`);
  localResults.forEach(result => {
    console.log(`   ${result.success ? '✅' : '❌'} ${result.endpoint}`);
  });
  
  const productionSuccess = productionResults.filter(r => r.success).length;
  const localSuccess = localResults.filter(r => r.success).length;
  
  console.log(`\n📊 Results:`);
  console.log(`   Production: ${productionSuccess}/${productionResults.length} endpoints working`);
  console.log(`   Local: ${localSuccess}/${localResults.length} endpoints working`);
  
  if (productionSuccess === 0) {
    console.log(`\n⚠️  Production proxy is not working. Possible issues:`);
    console.log(`   1. Backend container is not running`);
    console.log(`   2. Next.js proxy configuration is incorrect`);
    console.log(`   3. Container networking is not properly configured`);
    console.log(`   4. Domain SSL/DNS issues`);
  }
  
  if (localSuccess === 0) {
    console.log(`\n⚠️  Local development proxy is not working. Possible issues:`);
    console.log(`   1. Frontend server is not running (npm run dev)`);
    console.log(`   2. Backend server is not running (npm run start:dev)`);
    console.log(`   3. Proxy configuration in next.config.js is incorrect`);
  }
  
  console.log(`\n🔧 Configuration Check:`);
  console.log(`   Frontend .env.production: NEXT_PUBLIC_API_URL=https://householdplanet.co.ke`);
  console.log(`   Next.js proxy: /api/* → http://household-planet-backend:3001/api/*`);
  console.log(`   Docker container names: household-planet-frontend, household-planet-backend`);
}

// Additional test for direct backend access (should fail in production)
async function testDirectBackendAccess() {
  console.log('\n🔒 Testing Direct Backend Access (should be blocked in production)');
  console.log('-' .repeat(60));
  
  const directBackendUrls = [
    'http://158.220.99.195:3001/api/health',
    'https://householdplanet.co.ke:3001/api/health'
  ];
  
  for (const url of directBackendUrls) {
    try {
      const response = await axios.get(url, { timeout: 5000 });
      console.log(`⚠️  Direct backend access working: ${url} (Status: ${response.status})`);
      console.log(`   This might be a security concern in production`);
    } catch (error) {
      console.log(`✅ Direct backend access blocked: ${url}`);
      console.log(`   This is expected for single domain proxy setup`);
    }
  }
}

async function main() {
  await testProxyConfiguration();
  await testDirectBackendAccess();
  
  console.log('\n' + '=' .repeat(60));
  console.log('🎯 RECOMMENDATIONS FOR DOKPLOY DEPLOYMENT:');
  console.log('=' .repeat(60));
  console.log('1. Use the dokploy.yml configuration file');
  console.log('2. Ensure container names match: household-planet-frontend, household-planet-backend');
  console.log('3. Backend should only expose port 3001 internally (no external access)');
  console.log('4. Frontend should be the only service with external port 3000');
  console.log('5. Set NEXT_PUBLIC_API_URL=https://householdplanet.co.ke in production');
  console.log('6. Verify Next.js proxy rewrites are working correctly');
}

main().catch(console.error);