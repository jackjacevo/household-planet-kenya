const fetch = require('node-fetch');

async function testMultipleOrders() {
  console.log('🔍 Testing Multiple Order Invoices...\n');

  const orderIds = [1, 2, 3, 4, 5];
  
  for (const orderId of orderIds) {
    try {
      console.log(`Testing order ${orderId}:`);
      const response = await fetch(`https://api.householdplanetkenya.co.ke/api/orders/${orderId}/invoice`);
      
      if (response.ok) {
        console.log(`✅ Order ${orderId}: SUCCESS - Invoice generated`);
      } else {
        const errorText = await response.text();
        console.log(`❌ Order ${orderId}: ${response.status} - ${errorText.substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`❌ Order ${orderId}: Network error - ${error.message}`);
    }
    console.log('');
  }
}

testMultipleOrders();