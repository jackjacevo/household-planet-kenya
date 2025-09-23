const https = require('https');

const API_BASE = 'https://api.householdplanetkenya.co.ke';

// Test admin authentication and endpoints
async function testAdminAuth() {
  console.log('🔍 Testing Admin Authentication and API Endpoints...\n');
  
  // First, let's test if we can get a valid admin token
  const loginData = {
    email: 'admin@householdplanetkenya.co.ke',
    password: 'HouseholdPlanet2024!'
  };
  
  console.log('1. Testing admin login...');
  
  try {
    const loginResponse = await makeRequest('/api/auth/login', 'POST', loginData);
    
    if (loginResponse.success && loginResponse.data.accessToken) {
      console.log('✅ Admin login successful');
      const token = loginResponse.data.accessToken;
      const user = loginResponse.data.user;
      
      console.log(`   User: ${user.email} (Role: ${user.role})`);
      console.log(`   Token: ${token.substring(0, 20)}...`);
      
      // Test protected endpoints with the token
      console.log('\n2. Testing protected endpoints with admin token...');
      
      const protectedEndpoints = [
        '/api/promo-codes',
        '/api/analytics/dashboard',
        '/api/admin/dashboard',
        '/api/products/brands'
      ];
      
      for (const endpoint of protectedEndpoints) {
        try {
          const result = await makeAuthenticatedRequest(endpoint, 'GET', null, token);
          if (result.success) {
            console.log(`✅ ${endpoint}: Working`);
          } else {
            console.log(`❌ ${endpoint}: ${result.status} - ${result.error}`);
          }
        } catch (error) {
          console.log(`❌ ${endpoint}: ${error.message}`);
        }
      }
      
    } else {
      console.log('❌ Admin login failed');
      console.log('   Response:', loginResponse);
    }
    
  } catch (error) {
    console.log('❌ Login request failed:', error.message);
  }
  
  // Test CORS and basic connectivity
  console.log('\n3. Testing CORS and basic connectivity...');
  
  const basicEndpoints = [
    '/health',
    '/api/health',
    '/api/products',
    '/api/categories'
  ];
  
  for (const endpoint of basicEndpoints) {
    try {
      const result = await makeRequest(endpoint, 'GET');
      if (result.success) {
        console.log(`✅ ${endpoint}: Working`);
      } else {
        console.log(`❌ ${endpoint}: ${result.status} - ${result.error}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
  }
}

function makeRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve) => {
    const url = `${API_BASE}${endpoint}`;
    const postData = data ? JSON.stringify(data) : null;
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Admin-Test/1.0',
        'Origin': 'https://householdplanetkenya.co.ke'
      },
      timeout: 15000
    };
    
    const req = https.request(url, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = responseData ? JSON.parse(responseData) : {};
          resolve({
            success: res.statusCode < 400,
            status: res.statusCode,
            data: parsedData,
            error: res.statusCode >= 400 ? parsedData.message || res.statusMessage : null
          });
        } catch (parseError) {
          resolve({
            success: res.statusCode < 400,
            status: res.statusCode,
            data: responseData,
            error: res.statusCode >= 400 ? responseData : null
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        success: false,
        status: 0,
        error: error.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        status: 0,
        error: 'Request timeout'
      });
    });

    req.setTimeout(15000);
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

function makeAuthenticatedRequest(endpoint, method = 'GET', data = null, token) {
  return new Promise((resolve) => {
    const url = `${API_BASE}${endpoint}`;
    const postData = data ? JSON.stringify(data) : null;
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'Admin-Test/1.0',
        'Origin': 'https://householdplanetkenya.co.ke'
      },
      timeout: 15000
    };
    
    const req = https.request(url, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = responseData ? JSON.parse(responseData) : {};
          resolve({
            success: res.statusCode < 400,
            status: res.statusCode,
            data: parsedData,
            error: res.statusCode >= 400 ? parsedData.message || res.statusMessage : null
          });
        } catch (parseError) {
          resolve({
            success: res.statusCode < 400,
            status: res.statusCode,
            data: responseData,
            error: res.statusCode >= 400 ? responseData : null
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        success: false,
        status: 0,
        error: error.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        status: 0,
        error: 'Request timeout'
      });
    });

    req.setTimeout(15000);
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

testAdminAuth().catch(console.error);