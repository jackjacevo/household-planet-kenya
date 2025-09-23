const axios = require('axios');

async function addProductImages() {
  try {
    console.log('🖼️ Adding images to products...');
    
    // Login as admin
    const loginResponse = await axios.post('https://api.householdplanetkenya.co.ke/api/auth/login', {
      email: 'admin@householdplanetkenya.co.ke',
      password: 'Admin@2025'
    });
    
    const token = loginResponse.data.accessToken;
    const headers = { 'Authorization': `Bearer ${token}` };
    
    // Get all products
    const productsResponse = await axios.get('https://api.householdplanetkenya.co.ke/api/admin/products', { headers });
    const products = productsResponse.data.products || [];
    
    console.log(`Found ${products.length} products to update`);
    
    // Product images mapping
    const productImages = {
      'Non-Stick Frying Pan Set': ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80'],
      'Stainless Steel Cookware Set': ['https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800&q=80'],
      'Cotton Bath Towel Set': ['https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&q=80'],
      'All-Purpose Cleaner 500ml': ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'],
      'Cotton Bed Sheet Set': ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80'],
      'Storage Basket Set': ['https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80'],
      'Decorative Wall Mirror': ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80'],
      'Skincare Gift Set': ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80'],
      'Electric Kettle 1.7L': ['https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80'],
      'Ceramic Dinner Set': ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80'],
      'Bamboo Bath Mat': ['https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&q=80'],
      'Microfiber Cleaning Cloths': ['https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&q=80'],
      'Memory Foam Pillow': ['https://images.unsplash.com/photo-1586047844406-6abbf9fbe745?w=800&q=80'],
      'Plastic Storage Containers': ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'],
      'Throw Pillow Covers': ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80'],
      'Makeup Brush Set': ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80'],
      'Blender 1.5L': ['https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=800&q=80']
    };
    
    let updatedCount = 0;
    for (const product of products) {
      const images = productImages[product.name];
      if (images) {
        try {
          await axios.patch(`https://api.householdplanetkenya.co.ke/api/products/${product.id}`, {
            images: images
          }, { headers });
          
          updatedCount++;
          console.log(`✅ Updated images for: ${product.name}`);
        } catch (error) {
          console.log(`❌ Failed to update ${product.name}:`, error.response?.data?.message);
        }
      }
    }
    
    console.log(`\n🎉 Updated ${updatedCount}/${products.length} products with images`);
    
    // Test the results
    const finalProductsResponse = await axios.get('https://api.householdplanetkenya.co.ke/api/products');
    const finalProducts = finalProductsResponse.data.products || [];
    const productsWithImages = finalProducts.filter(p => p.images && p.images.length > 0);
    
    console.log(`📊 Final result: ${productsWithImages.length} products now have images`);
    
  } catch (error) {
    console.error('❌ Failed to add images:', error.response?.data || error.message);
  }
}

addProductImages();