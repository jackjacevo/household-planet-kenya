const fetch = require('node-fetch');

async function testProductionAPI() {
  const baseUrl = 'https://api.householdplanetkenya.co.ke';
  
  console.log('🔍 Testing production API endpoints...\n');
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${baseUrl}/health`);
    console.log(`Health status: ${healthResponse.status}`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.text();
      console.log(`Health response: ${healthData}`);
    }
    
    // Test categories hierarchy endpoint
    console.log('\n2. Testing categories hierarchy endpoint...');
    const categoriesResponse = await fetch(`${baseUrl}/api/categories/hierarchy`);
    console.log(`Categories status: ${categoriesResponse.status}`);
    console.log(`Categories headers:`, Object.fromEntries(categoriesResponse.headers.entries()));
    
    if (categoriesResponse.ok) {
      const categoriesData = await categoriesResponse.json();
      console.log(`✅ Categories loaded: ${categoriesData.length} categories`);
      
      if (categoriesData.length > 0) {
        console.log('First category:', categoriesData[0].name);
      }
    } else {
      const errorText = await categoriesResponse.text();
      console.log(`❌ Categories error: ${errorText}`);
    }
    
    // Test all categories endpoint
    console.log('\n3. Testing all categories endpoint...');
    const allCategoriesResponse = await fetch(`${baseUrl}/api/categories`);
    console.log(`All categories status: ${allCategoriesResponse.status}`);
    
    if (allCategoriesResponse.ok) {
      const allCategoriesData = await allCategoriesResponse.json();
      console.log(`✅ All categories loaded: ${allCategoriesData.length} categories`);
    } else {
      const errorText = await allCategoriesResponse.text();
      console.log(`❌ All categories error: ${errorText}`);
    }
    
  } catch (error) {
    console.error('❌ Error testing production API:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('🔧 DNS resolution failed. Check domain configuration.');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('🔧 Connection refused. Check if server is running.');
    } else if (error.message.includes('certificate')) {
      console.log('🔧 SSL certificate issue. Check HTTPS configuration.');
    }
  }
}

testProductionAPI();