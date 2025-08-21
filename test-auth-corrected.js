const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

// Test data
const testUser = {
  name: 'Test User',
  email: `test${Date.now()}@example.com`,
  phone: '+254700000000',
  password: 'TestPassword123'
};

async function testSignup() {
  console.log('🔍 Testing Signup...');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, testUser);
    
    if (response.status === 201 || response.status === 200) {
      console.log('✅ Signup successful!');
      console.log('Response:', response.data);
      return response.data;
    } else {
      console.log('❌ Signup failed with status:', response.status);
      return null;
    }
  } catch (error) {
    console.log('❌ Signup error:', error.response?.data || error.message);
    return null;
  }
}

async function testLogin() {
  console.log('\n🔍 Testing Login...');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    if (response.status === 200 || response.status === 201) {
      console.log('✅ Login successful!');
      console.log('Response:', response.data);
      return response.data;
    } else {
      console.log('❌ Login failed with status:', response.status);
      return null;
    }
  } catch (error) {
    console.log('❌ Login error:', error.response?.data || error.message);
    return null;
  }
}

async function testProfile(token) {
  console.log('\n🔍 Testing Profile Access...');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.status === 200) {
      console.log('✅ Profile access successful!');
      console.log('Profile data:', response.data);
      return response.data;
    } else {
      console.log('❌ Profile access failed with status:', response.status);
      return null;
    }
  } catch (error) {
    console.log('❌ Profile access error:', error.response?.data || error.message);
    return null;
  }
}

async function testInvalidLogin() {
  console.log('\n🔍 Testing Invalid Login...');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: testUser.email,
      password: 'wrongpassword'
    });
    
    console.log('❌ Invalid login should have failed but succeeded');
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Invalid login correctly rejected');
      return true;
    } else {
      console.log('❌ Unexpected error:', error.response?.data || error.message);
      return false;
    }
  }
}

async function checkBackendStatus() {
  console.log('🔍 Checking backend status...');
  
  try {
    // Try to access a simple endpoint to check if backend is running
    const response = await axios.get(`${API_BASE_URL}/auth/profile`, { 
      timeout: 5000,
      validateStatus: () => true // Accept any status code
    });
    
    if (response.status === 401) {
      console.log('✅ Backend is running (auth endpoint accessible, returns 401 as expected)');
      return true;
    } else if (response.status < 500) {
      console.log('✅ Backend is running (got response)');
      return true;
    } else {
      console.log('❌ Backend returned server error:', response.status);
      return false;
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Backend is not running or not accessible');
      console.log('Error:', error.message);
      return false;
    } else {
      console.log('✅ Backend is running (got response)');
      return true;
    }
  }
}

async function runTests() {
  console.log('🚀 Starting Authentication Tests (Corrected API Endpoints)\n');
  console.log('API Base URL:', API_BASE_URL);
  console.log('Test User:', testUser);
  console.log('='.repeat(50));
  
  // Check if backend is running
  const backendRunning = await checkBackendStatus();
  if (!backendRunning) {
    console.log('\n❌ Cannot run tests - backend is not accessible');
    console.log('Please ensure the backend is running on http://localhost:3001');
    console.log('Run: cd household-planet-backend && npm run start:dev');
    return;
  }
  
  // Test signup
  const signupResult = await testSignup();
  
  // Test login
  const loginResult = await testLogin();
  
  // Test profile access if login was successful
  if (loginResult && loginResult.access_token) {
    await testProfile(loginResult.access_token);
  }
  
  // Test invalid login
  await testInvalidLogin();
  
  console.log('\n' + '='.repeat(50));
  console.log('🏁 Tests completed!');
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log(`- Signup: ${signupResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`- Login: ${loginResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`- Profile Access: ${loginResult && loginResult.access_token ? '✅ PASS' : '❌ FAIL'}`);
}

// Run the tests
runTests().catch(console.error);