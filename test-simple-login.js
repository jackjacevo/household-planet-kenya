const fetch = require('node-fetch');

async function testLogin() {
  console.log('🔐 Testing simple login...\n');

  try {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Test-Client/1.0'
      },
      body: JSON.stringify({
        email: 'admin@householdplanetkenya.co.ke',
        password: 'Admin123!@#'
      })
    });

    console.log('Status:', response.status, response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('Response body:', responseText);

    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('✅ Login successful!');
      console.log('Access token:', data.access_token ? 'Present' : 'Missing');
      console.log('User:', data.user?.email, data.user?.role);
    } else {
      console.log('❌ Login failed');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testLogin();