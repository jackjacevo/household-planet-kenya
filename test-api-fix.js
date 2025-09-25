const axios = require('axios');

// Test the corrected API endpoints
const API_BASE = 'https://householdplanetkenya.co.ke/api';

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
        'User-Agent': 'Fix-Test/1.0'
      }
    });
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📊 Response:`, response.data);
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    
    if (error.response) {
      console.log(`📄 Status: ${error.response.status}`);
      if (error.response.status === 401) {
        console.log(`🔐 Authentication required - this is expected for protected endpoints`);
      } else {
        console.log(`💬 Data:`, error.response.data);
      }
    }
  }
}

async function main() {
  console.log('🔧 Testing API Fix...');
  
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n✨ API fix test complete!');
}

main().catch(console.error);