const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testDuplicateRegistration() {
  console.log('🔍 Testing Duplicate Registration...');
  
  const testUser = {
    name: 'Duplicate Test User',
    email: 'duplicate@example.com',
    phone: '+254700000002',
    password: 'TestPassword123'
  };
  
  try {
    // First registration
    await axios.post(`${API_BASE_URL}/auth/register`, testUser);
    console.log('✅ First registration successful');
    
    // Second registration with same email
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, testUser);
      console.log('❌ Duplicate registration should have failed');
      return false;
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Duplicate registration correctly rejected');
        console.log('Error message:', error.response.data.message);
        return true;
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
        return false;
      }
    }
  } catch (error) {
    console.log('❌ First registration failed:', error.response?.data || error.message);
    return false;
  }
}

async function testInvalidEmailFormat() {
  console.log('\n🔍 Testing Invalid Email Format...');
  
  const testUser = {
    name: 'Invalid Email User',
    email: 'invalid-email-format',
    phone: '+254700000003',
    password: 'TestPassword123'
  };
  
  try {
    await axios.post(`${API_BASE_URL}/auth/register`, testUser);
    console.log('❌ Invalid email should have been rejected');
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Invalid email format correctly rejected');
      console.log('Error details:', error.response.data);
      return true;
    } else {
      console.log('❌ Unexpected error:', error.response?.data || error.message);
      return false;
    }
  }
}

async function testWeakPassword() {
  console.log('\n🔍 Testing Weak Password...');
  
  const testUser = {
    name: 'Weak Password User',
    email: `weak${Date.now()}@example.com`,
    phone: '+254700000004',
    password: '123' // Too weak
  };
  
  try {
    await axios.post(`${API_BASE_URL}/auth/register`, testUser);
    console.log('❌ Weak password should have been rejected');
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Weak password correctly rejected');
      console.log('Error details:', error.response.data);
      return true;
    } else {
      console.log('❌ Unexpected error:', error.response?.data || error.message);
      return false;
    }
  }
}

async function testMissingFields() {
  console.log('\n🔍 Testing Missing Required Fields...');
  
  const incompleteUser = {
    name: 'Incomplete User',
    // Missing email, phone, password
  };
  
  try {
    await axios.post(`${API_BASE_URL}/auth/register`, incompleteUser);
    console.log('❌ Incomplete data should have been rejected');
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Missing fields correctly rejected');
      console.log('Error details:', error.response.data);
      return true;
    } else {
      console.log('❌ Unexpected error:', error.response?.data || error.message);
      return false;
    }
  }
}

async function testNonExistentUserLogin() {
  console.log('\n🔍 Testing Non-existent User Login...');
  
  try {
    await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'nonexistent@example.com',
      password: 'SomePassword123'
    });
    console.log('❌ Non-existent user login should have failed');
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Non-existent user login correctly rejected');
      return true;
    } else {
      console.log('❌ Unexpected error:', error.response?.data || error.message);
      return false;
    }
  }
}

async function testUnauthorizedProfileAccess() {
  console.log('\n🔍 Testing Unauthorized Profile Access...');
  
  try {
    await axios.get(`${API_BASE_URL}/auth/profile`);
    console.log('❌ Unauthorized access should have been rejected');
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Unauthorized access correctly rejected');
      return true;
    } else {
      console.log('❌ Unexpected error:', error.response?.data || error.message);
      return false;
    }
  }
}

async function testInvalidToken() {
  console.log('\n🔍 Testing Invalid JWT Token...');
  
  try {
    await axios.get(`${API_BASE_URL}/auth/profile`, {
      headers: {
        'Authorization': 'Bearer invalid-token-here'
      }
    });
    console.log('❌ Invalid token should have been rejected');
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Invalid token correctly rejected');
      return true;
    } else {
      console.log('❌ Unexpected error:', error.response?.data || error.message);
      return false;
    }
  }
}

async function runEdgeCaseTests() {
  console.log('🚀 Starting Authentication Edge Case Tests\n');
  console.log('='.repeat(60));
  
  const tests = [
    { name: 'Duplicate Registration', test: testDuplicateRegistration },
    { name: 'Invalid Email Format', test: testInvalidEmailFormat },
    { name: 'Weak Password', test: testWeakPassword },
    { name: 'Missing Fields', test: testMissingFields },
    { name: 'Non-existent User Login', test: testNonExistentUserLogin },
    { name: 'Unauthorized Profile Access', test: testUnauthorizedProfileAccess },
    { name: 'Invalid Token', test: testInvalidToken }
  ];
  
  const results = [];
  
  for (const { name, test } of tests) {
    const result = await test();
    results.push({ name, passed: result });
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 Edge Case Tests Completed!\n');
  
  console.log('📊 Test Summary:');
  results.forEach(({ name, passed }) => {
    console.log(`- ${name}: ${passed ? '✅ PASS' : '❌ FAIL'}`);
  });
  
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  
  console.log(`\n🎯 Overall: ${passedCount}/${totalCount} tests passed`);
  
  if (passedCount === totalCount) {
    console.log('🎉 All edge case tests passed! Authentication system is robust.');
  } else {
    console.log('⚠️  Some edge case tests failed. Review the authentication system.');
  }
}

runEdgeCaseTests().catch(console.error);