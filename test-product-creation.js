// Test script to verify product creation with images
const axios = require('axios');

async function testProductCreation() {
  try {
    console.log('Testing product creation with images...');
    
    // Test data for product creation
    const productData = {
      name: 'Test Product with Images',
      slug: 'test-product-with-images',
      description: 'This is a test product to verify image upload functionality',
      shortDescription: 'Test product for image upload',
      sku: 'TEST-IMG-001',
      price: 1500,
      comparePrice: 2000,
      categoryId: 1,
      stock: 10,
      lowStockThreshold: 5,
      trackStock: true,
      isActive: true,
      isFeatured: true,
      images: [
        '/uploads/temp/temp-1756488386927-504794565.webp',
        '/uploads/temp/temp-1756488574011-490841252.webp'
      ],
      tags: ['test', 'image-upload']
    };
    
    console.log('Product data:', JSON.stringify(productData, null, 2));
    
    // Note: This would need a valid JWT token to work
    console.log('✅ Test data prepared');
    console.log('To test manually:');
    console.log('1. Login to admin panel');
    console.log('2. Go to Add Product page');
    console.log('3. Upload some images');
    console.log('4. Fill in product details');
    console.log('5. Submit the form');
    console.log('6. Check if images appear on homepage and shop page');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testProductCreation();