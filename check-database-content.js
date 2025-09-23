const fetch = require('node-fetch');

async function checkDatabase() {
  const baseUrl = 'https://api.householdplanetkenya.co.ke/api';
  
  console.log('🔍 Checking database content...\n');
  
  try {
    // Check categories
    console.log('📂 Checking categories...');
    const categoriesResponse = await fetch(`${baseUrl}/categories`);
    console.log(`Categories API Status: ${categoriesResponse.status}`);
    
    if (categoriesResponse.ok) {
      const categories = await categoriesResponse.json();
      console.log(`Found ${categories.length} categories:`);
      categories.slice(0, 5).forEach(cat => {
        console.log(`  - ${cat.name} (ID: ${cat.id}, Active: ${cat.isActive})`);
      });
      if (categories.length > 5) console.log(`  ... and ${categories.length - 5} more`);
    } else {
      console.log('❌ Categories API failed');
    }
    
    console.log('\n📦 Checking products...');
    const productsResponse = await fetch(`${baseUrl}/products`);
    console.log(`Products API Status: ${productsResponse.status}`);
    
    if (productsResponse.ok) {
      const productsData = await productsResponse.json();
      const products = productsData.products || productsData;
      console.log(`Found ${products.length} products:`);
      products.slice(0, 5).forEach(prod => {
        console.log(`  - ${prod.name} (ID: ${prod.id}, Price: ${prod.price})`);
      });
      if (products.length > 5) console.log(`  ... and ${products.length - 5} more`);
    } else {
      console.log('❌ Products API failed');
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  }
}

checkDatabase();