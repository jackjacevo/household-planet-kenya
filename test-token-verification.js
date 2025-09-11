const fetch = require('node-fetch');

async function testTokenVerification() {
  console.log('🔍 Testing token verification and admin access...\n');

  try {
    // Step 1: Login
    console.log('1. Logging in as admin...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Test-Client/1.0'
      },
      body: JSON.stringify({
        email: 'admin@householdplanet.co.ke',
        password: 'Admin@2025'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed:', loginResponse.status);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    console.log('Full login response:', JSON.stringify(loginData, null, 2));
    
    const token = loginData.access_token || loginData.accessToken || loginData.token;
    console.log('Token found:', !!token);
    console.log('Token length:', token?.length);

    // Step 2: Test profile endpoint
    console.log('\n2. Testing profile endpoint...');
    const profileResponse = await fetch('http://localhost:3001/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log('✅ Profile endpoint works');
      console.log('Profile role:', profileData.user?.role);
    } else {
      console.log('❌ Profile endpoint failed:', profileResponse.status);
      const errorText = await profileResponse.text();
      console.log('Error:', errorText.substring(0, 200));
    }

    // Step 3: Test admin endpoint with detailed error
    console.log('\n3. Testing admin delivery locations endpoint...');
    const adminResponse = await fetch('http://localhost:3001/api/admin/delivery-locations', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Admin endpoint status:', adminResponse.status);
    console.log('Admin endpoint headers:', Object.fromEntries(adminResponse.headers.entries()));
    
    const adminResponseText = await adminResponse.text();
    console.log('Admin response:', adminResponseText);

    if (adminResponse.ok) {
      console.log('✅ Admin endpoint works');
    } else {
      console.log('❌ Admin endpoint failed');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testTokenVerification();