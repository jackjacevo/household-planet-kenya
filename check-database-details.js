const axios = require('axios');

async function checkDatabaseDetails() {
  try {
    // Check categories with details
    const categoriesResponse = await axios.get('https://api.householdplanetkenya.co.ke/api/categories');
    const categories = categoriesResponse.data;
    
    console.log('=== CATEGORIES ===');
    console.log(`Total: ${categories.length}`);
    
    if (categories.length > 0) {
      const sampleCategory = categories[0];
      console.log('Sample category structure:');
      console.log(JSON.stringify(sampleCategory, null, 2));
      
      // Check for images
      const categoriesWithImages = categories.filter(cat => cat.image);
      console.log(`Categories with images: ${categoriesWithImages.length}`);
    }
    
    // Check products
    const productsResponse = await axios.get('https://api.householdplanetkenya.co.ke/api/products');
    const products = productsResponse.data;
    
    console.log('\n=== PRODUCTS ===');
    console.log(`Total: ${products.length || 0}`);
    
    if (products.length > 0) {
      const sampleProduct = products[0];
      console.log('Sample product structure:');
      console.log(JSON.stringify(sampleProduct, null, 2));
    }
    
    // Check database health
    const healthResponse = await axios.get('https://api.householdplanetkenya.co.ke/api/health');
    console.log('\n=== DATABASE HEALTH ===');
    console.log(`Status: ${healthResponse.data.status}`);
    
  } catch (error) {
    console.error('Error checking database:', error.message);
  }
}

checkDatabaseDetails();