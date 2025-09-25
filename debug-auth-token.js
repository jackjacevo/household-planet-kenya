const BASE_URL = 'https://householdplanetkenya.co.ke';

async function debugAuth() {
  try {
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'householdplanet819@gmail.com',
        password: 'Admin@2025'
      }),
    });

    console.log('Login Status:', loginResponse.status);
    const loginData = await loginResponse.json();
    console.log('Login Response:', JSON.stringify(loginData, null, 2));

    if (loginData.access_token || loginData.token) {
      const token = loginData.access_token || loginData.token;
      console.log('\nTesting with token...');
      
      const testResponse = await fetch(`${BASE_URL}/api/payments/admin/stats`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API Status:', testResponse.status);
      const responseText = await testResponse.text();
      console.log('API Response:', responseText);
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugAuth();