const axios = require('axios');

// Test configuration
const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:3001';
const PRODUCTION_BACKEND_URL = 'http://158.220.99.195:3001';

async function testConnection(url, name) {
  try {
    console.log(`\n🔍 Testing ${name} connection to: ${url}`);
    
    const response = await axios.get(`${url}/api/health`, {
      timeout: 5000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ ${name} is responding`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Data:`, response.data);
    return true;
  } catch (error) {
    console.log(`❌ ${name} connection failed`);
    if (error.code === 'ECONNREFUSED') {
      console.log(`   Error: Connection refused - service not running`);
    } else if (error.code === 'ETIMEDOUT') {
      console.log(`   Error: Connection timeout`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
    return false;
  }
}

async function testApiEndpoints(baseUrl) {
  const endpoints = [
    '/api/categories',
    '/api/products',
    '/api/delivery/locations'
  ];

  console.log(`\n🧪 Testing API endpoints on ${baseUrl}:`);
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${baseUrl}${endpoint}`, {
        timeout: 5000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ ${endpoint} - Status: ${response.status}`);
    } catch (error) {
      console.log(`❌ ${endpoint} - Error: ${error.response?.status || error.message}`);
    }
  }
}

async function testCorsConfiguration(backendUrl) {
  console.log(`\n🌐 Testing CORS configuration from frontend to backend:`);
  
  try {
    // Simulate a frontend request with CORS headers
    const response = await axios.get(`${backendUrl}/api/categories`, {
      timeout: 5000,
      headers: {
        'Origin': 'http://localhost:3000',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ CORS request successful`);
    console.log(`   Access-Control-Allow-Origin: ${response.headers['access-control-allow-origin'] || 'Not set'}`);
    return true;
  } catch (error) {
    console.log(`❌ CORS request failed: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Testing Frontend-Backend Connection\n');
  console.log('=' .repeat(50));
  
  // Test local backend
  const localBackendRunning = await testConnection(BACKEND_URL, 'Local Backend');
  
  if (localBackendRunning) {
    await testApiEndpoints(BACKEND_URL);
    await testCorsConfiguration(BACKEND_URL);
  }
  
  // Test production backend
  console.log('\n' + '=' .repeat(50));
  const prodBackendRunning = await testConnection(PRODUCTION_BACKEND_URL, 'Production Backend');
  
  if (prodBackendRunning) {
    await testApiEndpoints(PRODUCTION_BACKEND_URL);
  }
  
  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log('📋 SUMMARY:');
  console.log(`Local Backend (${BACKEND_URL}): ${localBackendRunning ? '✅ Running' : '❌ Not Running'}`);
  console.log(`Production Backend (${PRODUCTION_BACKEND_URL}): ${prodBackendRunning ? '✅ Running' : '❌ Not Running'}`);
  
  if (!localBackendRunning && !prodBackendRunning) {
    console.log('\n⚠️  No backend services are running. Please start at least one backend service.');
    console.log('\nTo start local backend:');
    console.log('cd household-planet-backend && npm run start:dev');
  }
  
  console.log('\n🔧 Frontend Configuration:');
  console.log(`NEXT_PUBLIC_API_URL (local): http://localhost:3001`);
  console.log(`NEXT_PUBLIC_API_URL (production): http://158.220.99.195:3001`);
}

main().catch(console.error);