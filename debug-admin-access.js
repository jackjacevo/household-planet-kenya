const https = require('https');

const API_BASE = 'https://api.householdplanetkenya.co.ke';

async function debugAdminAccess() {
  try {
    console.log('🔍 Debugging admin access...\n');
    
    // 1. Login
    const loginResponse = await makeRequest('/api/auth/login', 'POST', {
      email: 'householdplanet819@gmail.com',
      password: 'Admin@2025'
    });
    
    if (!loginResponse.success) {
      console.log('❌ Login failed:', loginResponse.error);
      return;
    }
    
    console.log('✅ Login successful');
    const token = loginResponse.data.accessToken;
    const user = loginResponse.data.user;
    
    console.log('User data:', {
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    });
    
    // 2. Test staff endpoint
    console.log('\n🔍 Testing staff endpoint...');
    const staffResponse = await makeAuthenticatedRequest('/api/admin/staff', 'GET', null, token);
    
    if (staffResponse.success) {
      console.log('✅ Staff endpoint works');
      console.log('Staff data:', staffResponse.data);
    } else {
      console.log('❌ Staff endpoint failed:', staffResponse.error);
    }
    
    // 3. Test profile endpoint
    console.log('\n🔍 Testing profile endpoint...');
    const profileResponse = await makeAuthenticatedRequest('/api/auth/profile', 'GET', null, token);
    
    if (profileResponse.success) {
      console.log('✅ Profile endpoint works');
      console.log('Profile data:', {
        id: profileResponse.data.id,
        email: profileResponse.data.email,
        role: profileResponse.data.role,
        permissions: profileResponse.data.permissions
      });
    } else {
      console.log('❌ Profile endpoint failed:', profileResponse.error);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
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
        'Accept': 'application/json'
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
        'Authorization': `Bearer ${token}`
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

    req.setTimeout(15000);
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

debugAdminAccess();