const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testSecurityFixes() {
  console.log('🔒 Testing Security Vulnerability Fixes\n');

  // Test 1: CSRF Protection
  console.log('1. Testing CSRF Protection...');
  try {
    // Test CSRF token endpoint
    const csrfResponse = await axios.get(`${BASE_URL}/csrf/token`);
    console.log('✅ CSRF token endpoint accessible');
    console.log(`   Token received: ${csrfResponse.data.csrfToken ? 'Yes' : 'No'}`);
    console.log(`   Double-submit token: ${csrfResponse.data.doubleSubmitToken ? 'Yes' : 'No'}`);

    // Test state-changing request without CSRF token
    try {
      await axios.post(`${BASE_URL}/api/products`, {
        name: 'Test Product',
        price: 100
      });
      console.log('❌ CSRF protection failed - request succeeded without token');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ CSRF protection working - request blocked without token');
      } else {
        console.log(`⚠️  Unexpected error: ${error.response?.status || error.message}`);
      }
    }
  } catch (error) {
    console.log(`❌ CSRF test failed: ${error.message}`);
  }

  // Test 2: Log Injection Prevention
  console.log('\n2. Testing Log Injection Prevention...');
  try {
    const maliciousInputs = [
      'test\r\nINJECTED LOG ENTRY',
      'test\x00null_byte',
      'test${malicious}template',
      'test`command`substitution',
      'test<script>alert(1)</script>',
      'test\u2028line_separator'
    ];

    for (const input of maliciousInputs) {
      try {
        await axios.post(`${BASE_URL}/api/auth/login`, {
          email: input,
          password: 'test'
        });
      } catch (error) {
        // Expected to fail, we're testing log sanitization
      }
    }
    console.log('✅ Log injection test completed (check logs for sanitization)');
  } catch (error) {
    console.log(`❌ Log injection test failed: ${error.message}`);
  }

  // Test 3: HTTPS Redirection (only in production)
  console.log('\n3. Testing HTTPS Configuration...');
  if (process.env.NODE_ENV === 'production') {
    try {
      const httpResponse = await axios.get('http://localhost:3001/api/health', {
        maxRedirects: 0,
        validateStatus: (status) => status < 400
      });
      
      if (httpResponse.status === 301 || httpResponse.status === 302) {
        console.log('✅ HTTP to HTTPS redirection working');
        console.log(`   Redirect location: ${httpResponse.headers.location}`);
      } else {
        console.log('❌ HTTP to HTTPS redirection not working');
      }
    } catch (error) {
      console.log(`⚠️  HTTPS test: ${error.message}`);
    }
  } else {
    console.log('ℹ️  HTTPS redirection only active in production mode');
  }

  // Test 4: Security Headers
  console.log('\n4. Testing Security Headers...');
  try {
    const response = await axios.get(`${BASE_URL}/api/health`);
    const headers = response.headers;
    
    const securityHeaders = [
      'x-frame-options',
      'x-content-type-options',
      'referrer-policy',
      'content-security-policy'
    ];

    securityHeaders.forEach(header => {
      if (headers[header]) {
        console.log(`✅ ${header}: ${headers[header]}`);
      } else {
        console.log(`❌ Missing header: ${header}`);
      }
    });

    if (process.env.NODE_ENV === 'production' && headers['strict-transport-security']) {
      console.log(`✅ strict-transport-security: ${headers['strict-transport-security']}`);
    }
  } catch (error) {
    console.log(`❌ Security headers test failed: ${error.message}`);
  }

  // Test 5: Input Sanitization
  console.log('\n5. Testing Input Sanitization...');
  try {
    const maliciousInputs = [
      { email: '<script>alert(1)</script>@test.com', password: 'test' },
      { email: 'test@test.com', password: '${malicious}' },
      { email: 'test@test.com\r\nInjected: header', password: 'test' },
      { email: 'test@test.com', password: 'test\x00null' }
    ];

    for (const input of maliciousInputs) {
      try {
        await axios.post(`${BASE_URL}/api/auth/register`, input);
      } catch (error) {
        // Expected to fail due to validation
      }
    }
    console.log('✅ Input sanitization test completed');
  } catch (error) {
    console.log(`❌ Input sanitization test failed: ${error.message}`);
  }

  // Test 6: Rate Limiting
  console.log('\n6. Testing Rate Limiting...');
  try {
    const requests = [];
    for (let i = 0; i < 5; i++) {
      requests.push(
        axios.post(`${BASE_URL}/api/auth/login`, {
          email: 'test@test.com',
          password: 'wrong'
        }).catch(err => err.response)
      );
    }

    const responses = await Promise.all(requests);
    const rateLimited = responses.some(res => res?.status === 429);
    
    if (rateLimited) {
      console.log('✅ Rate limiting is working');
    } else {
      console.log('⚠️  Rate limiting may not be configured properly');
    }
  } catch (error) {
    console.log(`❌ Rate limiting test failed: ${error.message}`);
  }

  console.log('\n🔒 Security Testing Complete');
  console.log('\nRecommendations:');
  console.log('1. Check application logs for sanitized entries');
  console.log('2. Verify CSRF tokens are properly implemented in frontend');
  console.log('3. Test HTTPS redirection in production environment');
  console.log('4. Monitor security event logs for suspicious activity');
  console.log('5. Regularly update security configurations');
}

// Run tests
testSecurityFixes().catch(console.error);