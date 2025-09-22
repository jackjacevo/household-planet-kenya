const axios = require('axios');

async function verifyDatabaseStorage() {
  try {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AaG91c2Vob2xkcGxhbmV0a2VueWEuY28ua2UiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3MzIyNjM0NzIsImV4cCI6MTczMjg2ODI3Mn0.Qs8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'; // Replace with actual token
    
    console.log('Checking database storage...\n');
    
    // Check categories
    const categoriesResponse = await axios.get('https://api.householdplanetkenya.co.ke/api/categories');
    console.log(`✅ Categories: ${categoriesResponse.data.length || categoriesResponse.data.categories?.length || 0} found`);
    
    // Check products  
    const productsResponse = await axios.get('https://api.householdplanetkenya.co.ke/api/products');
    console.log(`✅ Products: ${productsResponse.data.length || productsResponse.data.products?.length || 0} found`);
    
    // Check admin data with auth
    if (token) {
      try {
        const adminCategoriesResponse = await axios.get('https://api.householdplanetkenya.co.ke/api/admin/categories', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Admin Categories: ${adminCategoriesResponse.data.length || 0} found`);
        
        const adminProductsResponse = await axios.get('https://api.householdplanetkenya.co.ke/api/admin/products', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Admin Products: ${adminProductsResponse.data.length || adminProductsResponse.data.products?.length || 0} found`);
        
        // Check recent uploads
        const dashboardResponse = await axios.get('https://api.householdplanetkenya.co.ke/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Dashboard data available`);
        
      } catch (authError) {
        console.log('⚠️  Admin endpoints require valid authentication');
      }
    }
    
  } catch (error) {
    console.error('❌ Database verification failed:', error.message);
  }
}

verifyDatabaseStorage();