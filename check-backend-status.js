#!/usr/bin/env node

const axios = require('axios');

async function checkBackend() {
  console.log('🔧 Checking Backend Status...\n');
  
  const BACKEND_URL = 'https://api.householdplanetkenya.co.ke';
  
  try {
    const response = await axios.get(`${BACKEND_URL}/health`, { 
      timeout: 10000,
      validateStatus: () => true
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
    
    if (response.status === 200) {
      console.log('\n✅ Backend is operational');
      
      // Test API endpoints
      const endpoints = ['/api/categories', '/api/products'];
      for (const endpoint of endpoints) {
        try {
          const apiResponse = await axios.get(`${BACKEND_URL}${endpoint}`, { timeout: 5000 });
          console.log(`✅ ${endpoint}: ${apiResponse.status}`);
        } catch (error) {
          console.log(`❌ ${endpoint}: ${error.response?.status || error.message}`);
        }
      }
    } else {
      console.log('\n❌ Backend has issues');
    }
    
  } catch (error) {
    console.log(`❌ Backend Error: ${error.message}`);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Data: ${JSON.stringify(error.response.data)}`);
    }
  }
}

checkBackend().catch(console.error);