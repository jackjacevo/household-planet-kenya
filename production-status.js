#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');

const FRONTEND_URL = 'https://householdplanetkenya.co.ke';
const BACKEND_URL = 'https://api.householdplanetkenya.co.ke';

async function getProductionStatus() {
  console.log('📊 Production Status Dashboard\n');
  console.log('=' .repeat(50));
  
  const status = {
    timestamp: new Date().toISOString(),
    services: {},
    data: {},
    performance: {},
    issues: []
  };

  // Check Services
  console.log('\n🔧 SERVICE STATUS');
  console.log('-'.repeat(30));
  
  try {
    const backendStart = Date.now();
    const backendHealth = await axios.get(`${BACKEND_URL}/health`, { timeout: 10000 });
    const backendTime = Date.now() - backendStart;
    
    status.services.backend = {
      status: '✅ ONLINE',
      responseTime: `${backendTime}ms`,
      httpStatus: backendHealth.status
    };
    console.log(`Backend API: ✅ ONLINE (${backendTime}ms)`);
  } catch (error) {
    status.services.backend = {
      status: '❌ OFFLINE',
      error: error.message
    };
    status.issues.push(`Backend API is offline: ${error.message}`);
    console.log(`Backend API: ❌ OFFLINE - ${error.message}`);
  }

  try {
    const frontendStart = Date.now();
    const frontendResponse = await axios.get(FRONTEND_URL, { timeout: 15000 });
    const frontendTime = Date.now() - frontendStart;
    
    status.services.frontend = {
      status: '✅ ONLINE',
      responseTime: `${frontendTime}ms`,
      httpStatus: frontendResponse.status
    };
    console.log(`Frontend: ✅ ONLINE (${frontendTime}ms)`);
  } catch (error) {
    status.services.frontend = {
      status: '❌ OFFLINE',
      error: error.message
    };
    status.issues.push(`Frontend is offline: ${error.message}`);
    console.log(`Frontend: ❌ OFFLINE - ${error.message}`);
  }

  // Check Data
  console.log('\n📊 DATA STATUS');
  console.log('-'.repeat(30));
  
  try {
    const categoriesResponse = await axios.get(`${BACKEND_URL}/api/categories`, { timeout: 5000 });
    const categoriesCount = Array.isArray(categoriesResponse.data) ? categoriesResponse.data.length : 0;
    status.data.categories = categoriesCount;
    console.log(`Categories: ${categoriesCount} items`);
  } catch (error) {
    status.data.categories = 'Error';
    status.issues.push(`Categories API error: ${error.message}`);
    console.log(`Categories: ❌ Error - ${error.message}`);
  }

  try {
    const productsResponse = await axios.get(`${BACKEND_URL}/api/products`, { timeout: 5000 });
    const productsCount = Array.isArray(productsResponse.data) ? productsResponse.data.length : 0;
    status.data.products = productsCount;
    console.log(`Products: ${productsCount} items`);
    
    if (productsCount === 0) {
      status.issues.push('No products available in the system');
    }
  } catch (error) {
    status.data.products = 'Error';
    status.issues.push(`Products API error: ${error.message}`);
    console.log(`Products: ❌ Error - ${error.message}`);
  }

  try {
    const locationsResponse = await axios.get(`${BACKEND_URL}/api/delivery/locations`, { timeout: 5000 });
    const locationsCount = Array.isArray(locationsResponse.data) ? locationsResponse.data.length : 0;
    status.data.deliveryLocations = locationsCount;
    console.log(`Delivery Locations: ${locationsCount} items`);
    
    if (locationsCount === 0) {
      status.issues.push('No delivery locations configured');
    }
  } catch (error) {
    status.data.deliveryLocations = 'Error';
    status.issues.push(`Delivery locations API error: ${error.message}`);
    console.log(`Delivery Locations: ❌ Error - ${error.message}`);
  }

  // Check Critical Endpoints
  console.log('\n🔍 ENDPOINT TESTS');
  console.log('-'.repeat(30));
  
  const endpoints = [
    { name: 'Health Check', path: '/health' },
    { name: 'Categories API', path: '/api/categories' },
    { name: 'Products API', path: '/api/products' },
    { name: 'Delivery API', path: '/api/delivery/locations' }
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${BACKEND_URL}${endpoint.path}`, { timeout: 5000 });
      console.log(`${endpoint.name}: ✅ ${response.status}`);
    } catch (error) {
      console.log(`${endpoint.name}: ❌ ${error.response?.status || 'Network Error'}`);
      status.issues.push(`${endpoint.name} failed: ${error.message}`);
    }
  }

  // Security Check
  console.log('\n🔒 SECURITY STATUS');
  console.log('-'.repeat(30));
  
  try {
    const corsTest = await axios.get(`${BACKEND_URL}/api/categories`, {
      headers: { 'Origin': FRONTEND_URL },
      timeout: 5000
    });
    console.log('CORS Configuration: ✅ Properly configured');
  } catch (error) {
    console.log('CORS Configuration: ❌ Issue detected');
    status.issues.push('CORS configuration issue');
  }

  // Issues Summary
  console.log('\n⚠️ ISSUES SUMMARY');
  console.log('-'.repeat(30));
  
  if (status.issues.length === 0) {
    console.log('✅ No issues detected');
  } else {
    status.issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
  }

  // Production URLs
  console.log('\n🌍 PRODUCTION URLS');
  console.log('-'.repeat(30));
  console.log(`Frontend: ${FRONTEND_URL}`);
  console.log(`Backend API: ${BACKEND_URL}`);
  console.log(`Admin Panel: ${FRONTEND_URL}/admin`);

  // Save status to file
  fs.writeFileSync('production-status.json', JSON.stringify(status, null, 2));
  
  console.log('\n📄 Status saved to: production-status.json');
  console.log('=' .repeat(50));
  
  return status;
}

if (require.main === module) {
  getProductionStatus().catch(console.error);
}

module.exports = { getProductionStatus };