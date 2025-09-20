#!/usr/bin/env node

const axios = require('axios');

const FRONTEND_URL = 'https://householdplanetkenya.co.ke';

async function testFrontend() {
  console.log('🌐 Testing Frontend Only...\n');
  
  const pages = [
    '/',
    '/products', 
    '/categories',
    '/login',
    '/register',
    '/cart',
    '/about'
  ];

  let passed = 0;
  let total = pages.length;

  for (const page of pages) {
    try {
      const response = await axios.get(`${FRONTEND_URL}${page}`, { 
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      console.log(`✅ ${page}: ${response.status}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${page}: ${error.response?.status || error.message}`);
    }
  }

  console.log(`\n📊 Frontend Test Results:`);
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`📈 Success Rate: ${Math.round((passed/total)*100)}%`);
  
  if (passed === total) {
    console.log('\n🎉 Frontend is fully operational!');
  } else {
    console.log('\n⚠️ Some frontend pages have issues');
  }
}

testFrontend().catch(console.error);