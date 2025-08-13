// Quick test script for authentication endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:3000'; // Change port if needed

async function testAuth() {
  try {
    console.log('🚀 Testing Authentication System...\n');

    // Test 1: Register a new user
    console.log('1. Testing user registration...');
    const registerData = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '+254712345678',
      password: 'TestPass123!',
      dateOfBirth: '1990-01-01',
      gender: 'male'
    };

    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, registerData);
    console.log('✅ Registration successful:', registerResponse.data.message);

    // Test 2: Login
    console.log('\n2. Testing user login...');
    const loginData = {
      email: 'test@example.com',
      password: 'TestPass123!'
    };

    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData);
    console.log('✅ Login successful');
    const { accessToken } = loginResponse.data;

    // Test 3: Get profile (authenticated)
    console.log('\n3. Testing authenticated profile access...');
    const profileResponse = await axios.get(`${BASE_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    console.log('✅ Profile access successful:', profileResponse.data.user.name);

    // Test 4: Add address
    console.log('\n4. Testing address management...');
    const addressData = {
      type: 'HOME',
      fullName: 'Test User',
      phone: '+254712345678',
      county: 'Nairobi',
      town: 'Nairobi',
      street: '123 Test Street',
      landmark: 'Near Test Mall',
      isDefault: true
    };

    const addressResponse = await axios.post(`${BASE_URL}/users/addresses`, addressData, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    console.log('✅ Address added successfully');

    console.log('\n🎉 All authentication tests passed!');
    console.log('\n📋 Available Endpoints:');
    console.log('POST /auth/register - User registration');
    console.log('POST /auth/login - User login');
    console.log('GET  /auth/verify-email/:token - Email verification');
    console.log('POST /auth/forgot-password - Password reset request');
    console.log('POST /auth/reset-password - Password reset');
    console.log('POST /auth/change-password - Change password');
    console.log('POST /auth/logout - User logout');
    console.log('GET  /users/profile - Get user profile');
    console.log('PATCH /users/profile - Update profile');
    console.log('GET  /users/addresses - Get addresses');
    console.log('POST /users/addresses - Add address');
    console.log('And more...');

  } catch (error) {
    if (error.response) {
      console.error('❌ Test failed:', error.response.data);
    } else {
      console.error('❌ Connection error. Make sure the server is running on the correct port.');
      console.log('💡 Try changing the port in main.ts or update BASE_URL in this script.');
    }
  }
}

// Run the test
testAuth();