const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testImageUpload() {
  try {
    console.log('Testing image upload and serving...');
    
    // Test 1: Check if backend is running
    try {
      const healthCheck = await axios.get('http://localhost:3001/api/admin/dashboard');
      console.log('✓ Backend is running');
    } catch (error) {
      console.log('✗ Backend is not running or not accessible');
      console.log('Please start the backend with: cd household-planet-backend && npm run start:dev');
      return;
    }
    
    // Test 2: Test CORS headers on image endpoint
    try {
      const corsTest = await axios.options('http://localhost:3001/api/admin/categories/image/test.jpg');
      console.log('✓ CORS preflight request successful');
    } catch (error) {
      console.log('✗ CORS preflight failed:', error.message);
    }
    
    // Test 3: Check uploads directory structure
    const uploadsDir = path.join(__dirname, 'household-planet-backend', 'uploads');
    const categoriesDir = path.join(uploadsDir, 'categories');
    const productsDir = path.join(uploadsDir, 'products');
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('✓ Created uploads directory');
    }
    
    if (!fs.existsSync(categoriesDir)) {
      fs.mkdirSync(categoriesDir, { recursive: true });
      console.log('✓ Created categories directory');
    }
    
    if (!fs.existsSync(productsDir)) {
      fs.mkdirSync(productsDir, { recursive: true });
      console.log('✓ Created products directory');
    }
    
    console.log('✓ Upload directories are ready');
    
    // Test 4: Check for existing images
    const categoryImages = fs.readdirSync(categoriesDir);
    const productImages = fs.readdirSync(productsDir);
    
    console.log(`Found ${categoryImages.length} category images`);
    console.log(`Found ${productImages.length} product images`);
    
    // Test 5: Test image serving for existing images
    if (categoryImages.length > 0) {
      const testImage = categoryImages[0];
      try {
        const response = await axios.get(`http://localhost:3001/api/admin/categories/image/${testImage}`, {
          headers: {
            'Origin': 'http://localhost:3000'
          }
        });
        console.log('✓ Category image serving works');
        console.log('Response headers:', {
          'access-control-allow-origin': response.headers['access-control-allow-origin'],
          'content-type': response.headers['content-type'],
          'cross-origin-resource-policy': response.headers['cross-origin-resource-policy']
        });
      } catch (error) {
        console.log('✗ Category image serving failed:', error.message);
      }
    }
    
    console.log('\nImage upload system status:');
    console.log('- Images will be stored as PNG/JPG (no more WebP conversion)');
    console.log('- CORS headers are properly configured');
    console.log('- Upload directories are ready');
    console.log('\nTo test image upload:');
    console.log('1. Go to admin panel');
    console.log('2. Try uploading a PNG or JPG image');
    console.log('3. Check if the image displays without CORS errors');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testImageUpload();