const axios = require('axios');

const API_BASE = 'https://householdplanetkenya.co.ke/api';

// Test endpoints that are failing
const endpoints = [
  '/orders/whatsapp/pending',
  '/orders/whatsapp/orders', 
  '/analytics/whatsapp-inquiries'
];

async function testEndpoint(endpoint) {
  try {
    console.log(`\n🔍 Testing: ${API_BASE}${endpoint}`);
    
    const response = await axios.get(`${API_BASE}${endpoint}`, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Debug-Script/1.0'
      }
    });
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📊 Data:`, response.data);
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    
    if (error.response) {
      console.log(`📄 Status: ${error.response.status}`);
      console.log(`📝 Headers:`, error.response.headers);
      console.log(`💬 Data:`, error.response.data);
    } else if (error.request) {
      console.log(`🔌 No response received`);
      console.log(`📡 Request:`, error.request);
    }
  }
}

async function testHealthCheck() {
  try {
    console.log(`\n🏥 Testing health check: ${API_BASE}/health`);
    
    const response = await axios.get(`${API_BASE}/health`, {
      timeout: 5000
    });
    
    console.log(`✅ Health Status: ${response.status}`);
    console.log(`📊 Health Data:`, response.data);
    
  } catch (error) {
    console.log(`❌ Health Check Failed: ${error.message}`);
  }
}

async function main() {
  console.log('🚀 Starting API Debug Session...');
  
  // Test health first
  await testHealthCheck();
  
  // Test each failing endpoint
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between requests
  }
  
  console.log('\n✨ Debug session complete!');
}

main().catch(console.error);