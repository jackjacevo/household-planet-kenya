const axios = require('axios');

async function testCategoriesApi() {
  try {
    const response = await axios.get('https://api.householdplanetkenya.co.ke/api/categories');
    console.log('Categories response:');
    console.log(JSON.stringify(response.data.slice(0, 3), null, 2));
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testCategoriesApi();