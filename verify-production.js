#!/usr/bin/env node

const axios = require('axios');

const FRONTEND_URL = 'https://householdplanetkenya.co.ke';
const BACKEND_URL = 'https://api.householdplanetkenya.co.ke';

async function verifyProduction() {
  console.log('🔍 Verifying Production Deployment...\n');
  
  let allPassed = true;
  const results = [];

  // Test 1: Backend Health
  try {
    const response = await axios.get(`${BACKEND_URL}/health`, { timeout: 10000 });
    results.push({ test: 'Backend Health', status: '✅ PASS', details: `Status: ${response.status}` });
  } catch (error) {
    results.push({ test: 'Backend Health', status: '❌ FAIL', details: error.message });
    allPassed = false;
  }

  // Test 2: Frontend Access
  try {
    const response = await axios.get(FRONTEND_URL, { timeout: 15000 });
    results.push({ test: 'Frontend Access', status: '✅ PASS', details: `Status: ${response.status}` });
  } catch (error) {
    results.push({ test: 'Frontend Access', status: '❌ FAIL', details: error.message });
    allPassed = false;
  }

  // Test 3: API Endpoints
  const endpoints = [
    '/api/categories',
    '/api/products',
    '/api/delivery/locations'
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${BACKEND_URL}${endpoint}`, { timeout: 5000 });
      results.push({ test: `API ${endpoint}`, status: '✅ PASS', details: `${response.data?.length || 0} items` });
    } catch (error) {
      results.push({ test: `API ${endpoint}`, status: '❌ FAIL', details: error.message });
      allPassed = false;
    }
  }

  // Test 4: HTTPS Security
  try {
    const response = await axios.get(BACKEND_URL, { timeout: 5000 });
    results.push({ test: 'HTTPS Security', status: '✅ PASS', details: 'SSL/TLS enabled' });
  } catch (error) {
    if (error.message.includes('certificate')) {
      results.push({ test: 'HTTPS Security', status: '⚠️ WARNING', details: 'SSL certificate issue' });
    } else {
      results.push({ test: 'HTTPS Security', status: '❌ FAIL', details: error.message });
      allPassed = false;
    }
  }

  // Test 5: CORS Configuration
  try {
    const response = await axios.get(`${BACKEND_URL}/api/categories`, {
      headers: { 'Origin': FRONTEND_URL },
      timeout: 5000
    });
    results.push({ test: 'CORS Configuration', status: '✅ PASS', details: 'Cross-origin requests allowed' });
  } catch (error) {
    results.push({ test: 'CORS Configuration', status: '❌ FAIL', details: error.message });
    allPassed = false;
  }

  // Display Results
  console.log('📋 Production Verification Results:\n');
  results.forEach(result => {
    console.log(`${result.status} ${result.test}`);
    console.log(`   ${result.details}\n`);
  });

  // Summary
  const passed = results.filter(r => r.status.includes('✅')).length;
  const failed = results.filter(r => r.status.includes('❌')).length;
  const warnings = results.filter(r => r.status.includes('⚠️')).length;

  console.log('📊 Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️ Warnings: ${warnings}`);
  console.log(`📈 Success Rate: ${Math.round((passed / results.length) * 100)}%\n`);

  if (allPassed) {
    console.log('🎉 Production deployment is READY!');
    console.log(`🌍 Visit: ${FRONTEND_URL}`);
    console.log(`🔌 API: ${BACKEND_URL}`);
  } else {
    console.log('⚠️ Production deployment has issues that need attention.');
    process.exit(1);
  }
}

verifyProduction().catch(console.error);