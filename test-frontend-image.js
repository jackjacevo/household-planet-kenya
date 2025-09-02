const fetch = require('node-fetch');

async function testFrontendImageLoading() {
  console.log('Testing image loading from frontend perspective...\n');
  
  // Test the categories API first
  try {
    const categoriesResponse = await fetch('http://localhost:3001/api/categories/hierarchy');
    if (categoriesResponse.ok) {
      const categories = await categoriesResponse.json();
      console.log('✅ Categories API working');
      
      // Find categories with localhost images
      const localImages = categories.filter(cat => 
        cat.image && cat.image.includes('localhost:3001')
      );
      
      console.log(`Found ${localImages.length} categories with localhost images:`);
      
      for (const category of localImages) {
        console.log(`\nTesting: ${category.name}`);
        console.log(`Image URL: ${category.image}`);
        
        try {
          const imageResponse = await fetch(category.image);
          console.log(`Status: ${imageResponse.status} ${imageResponse.statusText}`);
          
          if (imageResponse.ok) {
            const buffer = await imageResponse.buffer();
            console.log(`✅ Image loaded successfully (${buffer.length} bytes)`);
          } else {
            console.log(`❌ Image failed to load`);
          }
        } catch (error) {
          console.log(`❌ Error loading image: ${error.message}`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error testing categories:', error.message);
  }
}

testFrontendImageLoading();