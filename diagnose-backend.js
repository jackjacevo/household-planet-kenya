#!/usr/bin/env node

const axios = require('axios');

async function diagnoseBackend() {
  console.log('🔍 Diagnosing Backend Issues...\n');
  
  const BACKEND_URL = 'https://api.householdplanetkenya.co.ke';
  
  // Test different endpoints with detailed error reporting
  const endpoints = [
    '/health',
    '/api',
    '/api/categories',
    '/api/products'
  ];

  for (const endpoint of endpoints) {
    console.log(`Testing: ${BACKEND_URL}${endpoint}`);
    try {
      const response = await axios.get(`${BACKEND_URL}${endpoint}`, { 
        timeout: 10000,
        validateStatus: () => true // Don't throw on HTTP errors
      });
      
      console.log(`✅ Status: ${response.status}`);
      if (response.data) {
        console.log(`📊 Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      if (error.response) {
        console.log(`📊 Status: ${error.response.status}`);
        console.log(`📊 Data: ${JSON.stringify(error.response.data)}`);
      }
    }
    console.log('---');
  }

  // Test if it's a temporary issue
  console.log('\n🔄 Testing connectivity...');
  try {
    const response = await axios.get('https://httpbin.org/status/200', { timeout: 5000 });
    console.log('✅ Internet connectivity: OK');
  } catch (error) {
    console.log('❌ Internet connectivity: Issue');
  }

  // Check if frontend can reach backend
  console.log('\n🌐 Testing frontend...');
  try {
    const response = await axios.get('https://householdplanetkenya.co.ke', { timeout: 10000 });
    console.log(`✅ Frontend: ${response.status}`);
  } catch (error) {
    console.log(`❌ Frontend: ${error.message}`);
  }
}

diagnoseBackend().catch(console.error);