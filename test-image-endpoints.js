const fetch = require('node-fetch');

async function testImageEndpoints() {
  console.log('Testing image endpoints...\n');
  
  // Test the specific failing image
  const imageUrl = 'http://localhost:3001/api/admin/categories/image/category-1756841594419-62422924.jpeg';
  
  try {
    console.log(`Testing: ${imageUrl}`);
    const response = await fetch(imageUrl);
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const buffer = await response.buffer();
      console.log(`Image size: ${buffer.length} bytes`);
      console.log('✅ Image endpoint working correctly\n');
    } else {
      console.log('❌ Image endpoint failed\n');
    }
  } catch (error) {
    console.error('❌ Error testing image endpoint:', error.message);
  }
  
  // Test categories API
  try {
    console.log('Testing categories API...');
    const categoriesUrl = 'http://localhost:3001/api/categories/hierarchy';
    const response = await fetch(categoriesUrl);
    console.log(`Categories API Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`Found ${data.length} categories`);
      
      // Check image URLs in categories
      const categoriesWithImages = data.filter(cat => cat.image && cat.image.includes('localhost:3001'));
      console.log(`Categories with localhost images: ${categoriesWithImages.length}`);
      
      categoriesWithImages.forEach(cat => {
        console.log(`- ${cat.name}: ${cat.image}`);
      });
    }
  } catch (error) {
    console.error('❌ Error testing categories API:', error.message);
  }
}

testImageEndpoints();