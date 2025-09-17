const fetch = require('node-fetch');

async function testBackendHealth() {
  const baseUrl = 'http://localhost:3001';
  
  console.log('🏥 Testing backend health...');
  
  try {
    // Test health endpoint
    console.log('\n💓 Testing health endpoint...');
    const healthResponse = await fetch(`${baseUrl}/health`);
    console.log(`Status: ${healthResponse.status}`);
    
    if (healthResponse.ok) {
      const health = await healthResponse.json();
      console.log('Health:', health);
    } else {
      console.log('Error response:', await healthResponse.text());
    }
    
    // Test categories endpoint (should work)
    console.log('\n📂 Testing categories endpoint...');
    const categoriesResponse = await fetch(`${baseUrl}/categories`);
    console.log(`Status: ${categoriesResponse.status}`);
    
    if (categoriesResponse.ok) {
      const categories = await categoriesResponse.json();
      console.log(`Found ${categories.length} categories`);
    } else {
      console.log('Error response:', await categoriesResponse.text());
    }
    
    // Test content endpoints with different paths
    console.log('\n🔍 Testing different content paths...');
    const paths = [
      '/content/faqs',
      '/api/content/faqs',
      '/content/faqs/categories',
      '/api/content/faqs/categories'
    ];
    
    for (const path of paths) {
      const response = await fetch(`${baseUrl}${path}`);
      console.log(`${path}: ${response.status}`);
    }
    
  } catch (error) {
    console.error('❌ Error testing backend:', error.message);
  }
}

testBackendHealth();