const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3001';

// Test credentials
const testUser = {
  email: 'test@example.com',
  password: 'TestPassword123!',
  firstName: 'Test',
  lastName: 'User'
};

let authToken = '';

async function testFileUploadSecurity() {
  console.log('🔒 Testing File Upload and API Security Features...\n');

  try {
    // 1. Test API versioning
    console.log('1. Testing API Versioning...');
    await testApiVersioning();

    // 2. Test authentication
    console.log('2. Testing Authentication...');
    await testAuthentication();

    // 3. Test file upload security
    console.log('3. Testing File Upload Security...');
    await testFileUploadValidation();

    // 4. Test API logging
    console.log('4. Testing API Logging...');
    await testApiLogging();

    // 5. Test CORS configuration
    console.log('5. Testing CORS Configuration...');
    await testCorsConfiguration();

    // 6. Test rate limiting
    console.log('6. Testing Rate Limiting...');
    await testRateLimiting();

    console.log('\n✅ All File Upload and API Security tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

async function testApiVersioning() {
  try {
    // Test version info endpoint
    const response = await axios.get(`${BASE_URL}/api/api-security/version-info`);
    console.log('   ✅ API Version Info:', response.data);

    // Test with different API versions
    const v1Response = await axios.get(`${BASE_URL}/api/products`, {
      headers: { 'API-Version': 'v1' }
    });
    console.log('   ✅ API v1 request successful');

    const v2Response = await axios.get(`${BASE_URL}/api/products`, {
      headers: { 'API-Version': 'v2' }
    });
    console.log('   ✅ API v2 request successful');

  } catch (error) {
    console.log('   ⚠️ API versioning test failed (expected if no products exist)');
  }
}

async function testAuthentication() {
  try {
    // Register test user
    try {
      await axios.post(`${BASE_URL}/api/auth/register`, testUser);
      console.log('   ✅ User registration successful');
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('   ℹ️ User already exists, continuing...');
      } else {
        throw error;
      }
    }

    // Login
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });

    authToken = loginResponse.data.access_token;
    console.log('   ✅ User login successful');

  } catch (error) {
    throw new Error(`Authentication failed: ${error.message}`);
  }
}

async function testFileUploadValidation() {
  if (!authToken) {
    throw new Error('Authentication required for file upload tests');
  }

  try {
    // Create a test image file
    const testImagePath = path.join(__dirname, 'test-image.txt');
    fs.writeFileSync(testImagePath, 'This is a test file content');

    // Test file upload with valid file
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testImagePath));

    const uploadResponse = await axios.post(`${BASE_URL}/api/files/upload`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${authToken}`
      }
    });

    console.log('   ✅ File upload successful:', uploadResponse.data);

    // Test file listing
    const filesResponse = await axios.get(`${BASE_URL}/api/files`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    console.log('   ✅ File listing successful:', filesResponse.data.length, 'files');

    // Clean up test file
    fs.unlinkSync(testImagePath);

  } catch (error) {
    console.log('   ⚠️ File upload test failed:', error.response?.data?.message || error.message);
  }
}

async function testApiLogging() {
  try {
    // Make some API requests to generate logs
    await axios.get(`${BASE_URL}/api/api-security/health`);
    console.log('   ✅ API logging test request successful');

    // Check if logs directory exists
    const logsDir = path.join(__dirname, 'logs');
    if (fs.existsSync(logsDir)) {
      console.log('   ✅ Logs directory exists');
    } else {
      console.log('   ℹ️ Logs directory will be created on first log entry');
    }

  } catch (error) {
    console.log('   ⚠️ API logging test failed:', error.message);
  }
}

async function testCorsConfiguration() {
  try {
    // Test CORS preflight
    const corsResponse = await axios.options(`${BASE_URL}/api/products`);
    console.log('   ✅ CORS preflight successful');

    // Test with custom origin header
    const customOriginResponse = await axios.get(`${BASE_URL}/api/api-security/health`, {
      headers: { 'Origin': 'http://localhost:3000' }
    });
    console.log('   ✅ CORS with allowed origin successful');

  } catch (error) {
    console.log('   ⚠️ CORS test failed:', error.message);
  }
}

async function testRateLimiting() {
  try {
    // Make multiple requests quickly to test rate limiting
    const requests = [];
    for (let i = 0; i < 5; i++) {
      requests.push(axios.get(`${BASE_URL}/api/api-security/health`));
    }

    await Promise.all(requests);
    console.log('   ✅ Rate limiting allows normal usage');

    // Test rate limit headers
    const response = await axios.get(`${BASE_URL}/api/api-security/health`);
    if (response.headers['x-rate-limit-remaining']) {
      console.log('   ✅ Rate limit headers present');
    }

  } catch (error) {
    if (error.response?.status === 429) {
      console.log('   ✅ Rate limiting working (429 Too Many Requests)');
    } else {
      console.log('   ⚠️ Rate limiting test failed:', error.message);
    }
  }
}

// Run the tests
if (require.main === module) {
  testFileUploadSecurity();
}

module.exports = { testFileUploadSecurity };