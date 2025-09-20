const fetch = require('node-fetch');

async function checkOrder3() {
  console.log('🔍 Checking Order 3...\n');

  try {
    // First check if order 3 exists
    const response = await fetch('https://api.householdplanetkenya.co.ke/api/orders/3', {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMsImVtYWlsIjoiamFja2phY2V2b0BnbWFpbC5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3MjY4NTY5NjEsImV4cCI6MTcyNzQ2MTc2MX0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'
      }
    });
    
    console.log(`Order API Status: ${response.status}`);
    
    if (response.ok) {
      const order = await response.json();
      console.log(`✅ Order 3 exists: ${order.orderNumber}`);
      console.log(`Status: ${order.status}`);
      console.log(`User ID: ${order.userId || 'Guest'}`);
      console.log(`Items: ${order.items?.length || 0}`);
    } else {
      console.log(`❌ Order 3 not found or access denied`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

checkOrder3();