const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE = process.env.API_URL || 'https://api.householdplanetkenya.co.ke';

async function testUploadEndpoints() {
  console.log('🧪 Testing Upload Endpoints Fix');
  console.log('================================');
  
  // Test authentication first
  console.log('\n1. Testing Authentication...');
  try {
    const authResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'admin@householdplanetkenya.co.ke',
      password: 'Admin@2024!'
    });
    
    if (authResponse.data.token) {
      console.log('✅ Authentication successful');
      const token = authResponse.data.token;
      
      // Test upload endpoints
      await testUploadEndpoint(token, `${API_BASE}/api/upload/product`, 'file');
      await testUploadEndpoint(token, `${API_BASE}/api/upload/products`, 'images');
      await testUploadEndpoint(token, `${API_BASE}/api/admin/products/temp/images`, 'images');
      
    } else {
      console.log('❌ Authentication failed - no token received');
    }
  } catch (error) {
    console.log('❌ Authentication failed:', error.response?.data || error.message);
  }
}

async function testUploadEndpoint(token, endpoint, fieldName) {
  console.log(`\n2. Testing ${endpoint}...`);
  
  try {
    // Create a simple test image buffer (1x1 PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 dimensions
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
      0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, // IDAT chunk
      0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00,
      0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01,
      0xE2, 0x21, 0xBC, 0x33, 0x00, 0x00, 0x00, 0x00, // IEND chunk
      0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    const formData = new FormData();
    formData.append(fieldName, testImageBuffer, {
      filename: 'test-image.png',
      contentType: 'image/png'
    });
    
    const response = await axios.post(endpoint, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      },
      timeout: 10000
    });
    
    console.log('✅ Upload successful:', response.data);
    
  } catch (error) {
    console.log('❌ Upload failed:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
  }
}

// Test CORS
async function testCORS() {
  console.log('\n3. Testing CORS...');
  try {
    const response = await axios.options(`${API_BASE}/api/upload/product`, {
      headers: {
        'Origin': 'https://householdplanetkenya.co.ke',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    
    console.log('✅ CORS preflight successful');
    console.log('CORS headers:', {
      'Access-Control-Allow-Origin': response.headers['access-control-allow-origin'],
      'Access-Control-Allow-Methods': response.headers['access-control-allow-methods'],
      'Access-Control-Allow-Headers': response.headers['access-control-allow-headers']
    });
  } catch (error) {
    console.log('❌ CORS preflight failed:', error.response?.status, error.response?.statusText);
  }
}

// Test health endpoint
async function testHealth() {
  console.log('\n4. Testing Health Endpoint...');
  try {
    const response = await axios.get(`${API_BASE}/api/health`);
    console.log('✅ Health check successful:', response.data);
  } catch (error) {
    console.log('❌ Health check failed:', error.response?.data || error.message);
  }
}

async function runAllTests() {
  await testHealth();
  await testCORS();
  await testUploadEndpoints();
  
  console.log('\n🏁 Test completed!');
  console.log('If uploads are still failing, check:');
  console.log('1. JWT token is valid and not expired');
  console.log('2. User has proper permissions (ADMIN/STAFF role)');
  console.log('3. CORS is properly configured for your domain');
  console.log('4. File size and type restrictions');
  console.log('5. Server logs for detailed error messages');
}

runAllTests().catch(console.error);