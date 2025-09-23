const axios = require('axios');

async function testCategoriesSimple() {
  try {
    const response = await axios.get('https://api.householdplanetkenya.co.ke/api/categories');
    const categories = response.data.slice(0, 3);
    categories.forEach(cat => {
      console.log(`Category: ${cat.name}`);
      console.log(`Image: ${cat.image}`);
      console.log('---');
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testCategoriesSimple();