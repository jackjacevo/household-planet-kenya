const axios = require('axios');

async function debugCategoryUpdateError() {
  try {
    // Test the category update endpoint
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AaG91c2Vob2xkcGxhbmV0a2VueWEuY28ua2UiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3MzIyNjM0NzIsImV4cCI6MTczMjg2ODI3Mn0.Qs8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'; // Replace with actual token
    
    console.log('Testing category update endpoint...\n');
    
    // First get category 4 details
    try {
      const getResponse = await axios.get('https://api.householdplanetkenya.co.ke/api/categories');
      const categories = getResponse.data;
      const category4 = categories.find(cat => cat.id === 4);
      
      if (category4) {
        console.log('Category 4 details:');
        console.log(JSON.stringify(category4, null, 2));
        
        // Test update with minimal data
        const updateData = {
          name: category4.name,
          slug: category4.slug,
          description: category4.description,
          image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/wA==',
          isActive: category4.isActive,
          parentId: category4.parentId
        };
        
        console.log('\nTesting PUT request...');
        const putResponse = await axios.put(
          `https://api.householdplanetkenya.co.ke/api/categories/4`,
          updateData,
          {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log('✅ Update successful:', putResponse.status);
        
      } else {
        console.log('❌ Category 4 not found');
      }
      
    } catch (error) {
      if (error.response) {
        console.log('❌ Error Response:');
        console.log('Status:', error.response.status);
        console.log('Data:', error.response.data);
        console.log('Headers:', error.response.headers);
      } else {
        console.log('❌ Network Error:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

debugCategoryUpdateError();