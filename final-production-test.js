#!/usr/bin/env node

const axios = require('axios');

async function finalTest() {
  console.log('🎯 Final Production Test\n');
  
  const FRONTEND_URL = 'https://householdplanetkenya.co.ke';
  const BACKEND_URL = 'https://api.householdplanetkenya.co.ke';
  
  let results = { passed: 0, total: 0 };
  
  // Frontend Tests
  console.log('🌐 Frontend Tests:');
  const pages = ['/', '/products', '/categories', '/login'];
  
  for (const page of pages) {
    results.total++;
    try {
      const response = await axios.get(`${FRONTEND_URL}${page}`, { timeout: 10000 });
      console.log(`✅ ${page}: ${response.status}`);
      results.passed++;
    } catch (error) {
      console.log(`❌ ${page}: Error`);
    }
  }
  
  // Backend Tests  
  console.log('\n🔧 Backend Tests:');
  const endpoints = ['/health', '/api/categories', '/api/products'];
  
  for (const endpoint of endpoints) {
    results.total++;
    try {
      const response = await axios.get(`${BACKEND_URL}${endpoint}`, { timeout: 5000 });
      console.log(`✅ ${endpoint}: ${response.status}`);
      results.passed++;
    } catch (error) {
      console.log(`❌ ${endpoint}: Error`);
    }
  }
  
  // Summary
  const successRate = Math.round((results.passed / results.total) * 100);
  console.log(`\n📊 Final Results:`);
  console.log(`✅ Passed: ${results.passed}/${results.total}`);
  console.log(`📈 Success Rate: ${successRate}%`);
  
  if (successRate >= 85) {
    console.log('\n🎉 PRODUCTION READY!');
    console.log(`🌍 Live Site: ${FRONTEND_URL}`);
    console.log(`🔌 API: ${BACKEND_URL}`);
  } else {
    console.log('\n⚠️ Needs attention');
  }
}

finalTest().catch(console.error);