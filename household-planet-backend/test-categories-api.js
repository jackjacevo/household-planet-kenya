const fetch = require('node-fetch');

async function testCategoriesAPI() {
  try {
    console.log('=== Testing Categories API Endpoint ===\n');
    
    const response = await fetch('http://localhost:3001/api/categories/hierarchy');
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('\nAPI Response Analysis:');
    console.log('Data type:', typeof data);
    console.log('Is array:', Array.isArray(data));
    console.log('Length:', data?.length);
    
    if (data && Array.isArray(data) && data.length > 0) {
      console.log('\nFirst category structure:');
      console.log(JSON.stringify(data[0], null, 2));
      
      console.log('\nAll categories returned by API:');
      data.forEach((cat, index) => {
        console.log(`${index + 1}. ${cat.name} - Children: ${cat.children?.length || 0}`);
      });
    } else {
      console.log('❌ No categories found or invalid data structure from API');
      console.log('Raw response:', data);
    }
    
  } catch (error) {
    console.error('❌ Error testing categories API:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('Backend server is not running. Please start the backend server first.');
    }
  }
}

testCategoriesAPI();
