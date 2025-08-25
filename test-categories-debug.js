const fetch = require('node-fetch');

async function testCategoriesAPI() {
  try {
    console.log('Testing categories API...');
    
    const response = await fetch('http://localhost:3001/api/categories/hierarchy');
    const data = await response.json();
    
    console.log('API Response Status:', response.status);
    console.log('Data type:', typeof data);
    console.log('Is array:', Array.isArray(data));
    console.log('Length:', data?.length);
    
    if (data && Array.isArray(data) && data.length > 0) {
      console.log('\nFirst category structure:');
      console.log(JSON.stringify(data[0], null, 2));
      
      console.log('\nAll categories with images:');
      data.forEach((cat, index) => {
        console.log(`${index + 1}. ${cat.name}`);
        console.log(`   Slug: ${cat.slug}`);
        console.log(`   Image: ${cat.image || 'NO IMAGE'}`);
        console.log(`   Children: ${cat.children?.length || 0}`);
        console.log('');
      });
    } else {
      console.log('No categories found or invalid data structure');
    }
    
  } catch (error) {
    console.error('Error testing categories API:', error);
  }
}

testCategoriesAPI();