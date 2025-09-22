const axios = require('axios');

async function checkCategoriesWithImages() {
  try {
    const response = await axios.get('https://api.householdplanetkenya.co.ke/api/categories');
    const categories = response.data;
    
    const categoriesWithImages = categories.filter(cat => cat.image);
    console.log(`Categories with images: ${categoriesWithImages.length}/${categories.length}`);
    
    categoriesWithImages.forEach(cat => {
      console.log(`- ${cat.name}: ${cat.image}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkCategoriesWithImages();