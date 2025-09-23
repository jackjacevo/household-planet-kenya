const fetch = require('node-fetch');

const API_BASE = 'https://api.householdplanetkenya.co.ke/api';

async function testDatabaseData() {
  console.log('Testing database data...\n');

  try {
    // Test categories
    console.log('1. Testing Categories:');
    const categoriesRes = await fetch(`${API_BASE}/categories`);
    console.log(`Status: ${categoriesRes.status}`);
    
    if (categoriesRes.ok) {
      const categories = await categoriesRes.json();
      console.log(`Found ${categories.length} categories`);
      if (categories.length > 0) {
        console.log('Sample categories:', categories.slice(0, 3).map(c => c.name));
      }
    } else {
      console.log('Categories endpoint failed');
    }

    console.log('\n2. Testing Products:');
    const productsRes = await fetch(`${API_BASE}/products`);
    console.log(`Status: ${productsRes.status}`);
    
    if (productsRes.ok) {
      const productsData = await productsRes.json();
      const products = productsData.data || productsData;
      console.log(`Found ${products.length} products`);
      if (products.length > 0) {
        console.log('Sample products:', products.slice(0, 3).map(p => p.name));
      }
    } else {
      console.log('Products endpoint failed');
    }

    console.log('\n3. Testing Health:');
    const healthRes = await fetch(`${API_BASE}/health`);
    console.log(`Health Status: ${healthRes.status}`);
    if (healthRes.ok) {
      const health = await healthRes.json();
      console.log('Health:', health);
    }

  } catch (error) {
    console.error('Error testing database:', error.message);
  }
}

testDatabaseData();