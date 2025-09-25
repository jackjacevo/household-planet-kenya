async function testDirectBackend() {
  try {
    // Login to backend directly
    const loginResponse = await fetch('https://api.householdplanetkenya.co.ke/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'householdplanet819@gmail.com',
        password: 'Admin@2025'
      }),
    });

    console.log('Direct Backend Login:', loginResponse.status);
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      const token = loginData.access_token || loginData.token;
      
      // Test direct backend payment stats
      const statsResponse = await fetch('https://api.householdplanetkenya.co.ke/payments/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Direct Backend Stats:', statsResponse.status);
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        console.log('✅ Direct backend working');
        console.log('Stats:', JSON.stringify(stats, null, 2));
      } else {
        const error = await statsResponse.text();
        console.log('❌ Direct backend error:', error);
      }
    } else {
      console.log('❌ Direct backend login failed');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testDirectBackend();