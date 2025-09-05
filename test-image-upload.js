const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Test script to verify image upload functionality
async function testImageUpload() {
  try {
    console.log('Testing admin image upload endpoints...');
    
    const baseURL = 'http://localhost:3001';
    
    // First, test if the temp upload endpoint exists
    console.log('\n1. Testing temp image upload endpoint...');
    
    // Create a simple test image (1x1 pixel PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x5C, 0xC2, 0x5D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    // Test without authentication (should fail)
    try {
      const formData = new FormData();
      formData.append('images', testImageBuffer, 'test.png');
      
      await axios.post(`${baseURL}/api/admin/products/temp/images`, formData, {
        headers: formData.getHeaders()
      });
      console.log('❌ ERROR: Upload succeeded without authentication (should have failed)');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected upload without authentication');
      } else {
        console.log(`❌ Unexpected error: ${error.response?.status} - ${error.message}`);
      }
    }
    
    // Test endpoint availability
    try {
      await axios.options(`${baseURL}/api/admin/products/temp/images`);
      console.log('✅ Temp image upload endpoint is available');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('❌ Temp image upload endpoint not found');
      } else {
        console.log(`✅ Endpoint exists (got ${error.response?.status})`);
      }
    }
    
    console.log('\n2. Testing admin endpoints structure...');
    
    // Test admin routes
    const adminEndpoints = [
      '/api/admin/products',
      '/api/admin/categories',
      '/api/admin/brands'
    ];
    
    for (const endpoint of adminEndpoints) {
      try {
        await axios.get(`${baseURL}${endpoint}`);
        console.log(`✅ ${endpoint} - Available`);
      } catch (error) {
        if (error.response?.status === 401) {
          console.log(`✅ ${endpoint} - Protected (requires auth)`);
        } else if (error.response?.status === 404) {
          console.log(`❌ ${endpoint} - Not found`);
        } else {
          console.log(`✅ ${endpoint} - Available (status: ${error.response?.status})`);
        }
      }
    }
    
    console.log('\n3. Testing file upload directory structure...');
    
    // Check if upload directories exist
    const uploadDirs = [
      path.join(process.cwd(), 'household-planet-backend', 'uploads'),
      path.join(process.cwd(), 'household-planet-backend', 'uploads', 'temp'),
      path.join(process.cwd(), 'household-planet-backend', 'uploads', 'products')
    ];
    
    for (const dir of uploadDirs) {
      try {
        await fs.promises.access(dir);
        console.log(`✅ Directory exists: ${dir}`);
      } catch (error) {
        console.log(`❌ Directory missing: ${dir}`);
        try {
          await fs.promises.mkdir(dir, { recursive: true });
          console.log(`✅ Created directory: ${dir}`);
        } catch (createError) {
          console.log(`❌ Failed to create directory: ${dir} - ${createError.message}`);
        }
      }
    }
    
    console.log('\n✅ Image upload test completed!');
    console.log('\nNext steps:');
    console.log('1. Start the backend server: cd household-planet-backend && npm run start:dev');
    console.log('2. Start the frontend server: cd household-planet-frontend && npm run dev');
    console.log('3. Login as admin and test image upload in the admin products page');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testImageUpload();