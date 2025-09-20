const fetch = require('node-fetch');

async function testOrdersCount() {
  console.log('🔍 Testing Orders Count...\n');

  try {
    // Test orders endpoint without auth to see if there are orders
    const response = await fetch('https://api.householdplanetkenya.co.ke/api/orders');
    console.log(`Orders API Status: ${response.status}`);
    
    // Test products count
    const productsResponse = await fetch('https://api.householdplanetkenya.co.ke/api/products');
    console.log(`Products API Status: ${productsResponse.status}`);
    
    if (productsResponse.ok) {
      const productsData = await productsResponse.json();
      console.log(`✅ Products found: ${productsData.products?.length || 0}`);
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

testOrdersCount();