const fetch = require('node-fetch');

async function testInvoiceEndpoint() {
  console.log('🔍 Testing Invoice Endpoint...\n');

  try {
    const response = await fetch('https://api.householdplanetkenya.co.ke/api/orders/3/invoice');
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ Error Response: ${errorText}`);
    } else {
      console.log(`✅ SUCCESS - Invoice generated`);
    }
  } catch (error) {
    console.log(`❌ Network Error: ${error.message}`);
  }
}

testInvoiceEndpoint();