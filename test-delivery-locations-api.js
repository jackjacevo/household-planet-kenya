const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001';

async function testDeliveryLocationsAPI() {
  console.log('🧪 Testing Delivery Locations API...\n');

  try {
    // Test 1: Get all locations (should work without auth for public endpoint)
    console.log('1. Testing GET /api/delivery/locations (public)');
    const publicResponse = await fetch(`${API_BASE}/api/delivery/locations`);
    const publicData = await publicResponse.json();
    console.log('✅ Public locations:', publicData.data?.length || 0, 'locations');

    // Test 2: Try admin endpoint without auth (should fail)
    console.log('\n2. Testing GET /api/admin/delivery-locations (no auth)');
    const noAuthResponse = await fetch(`${API_BASE}/api/admin/delivery-locations`);
    console.log('Status:', noAuthResponse.status, noAuthResponse.statusText);
    if (!noAuthResponse.ok) {
      const errorText = await noAuthResponse.text();
      console.log('Error response:', errorText.substring(0, 200));
    }

    // Test 3: Login as admin to get token
    console.log('\n3. Logging in as admin...');
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@householdplanetkenya.co.ke',
        password: 'Admin123!@#'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed:', loginResponse.status);
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.access_token;
    console.log('✅ Login successful, token received');

    // Test 4: Get locations with admin auth
    console.log('\n4. Testing GET /api/admin/delivery-locations (with auth)');
    const adminResponse = await fetch(`${API_BASE}/api/admin/delivery-locations`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (adminResponse.ok) {
      const adminData = await adminResponse.json();
      console.log('✅ Admin locations:', adminData.data?.length || 0, 'locations');
      
      if (adminData.data && adminData.data.length > 0) {
        console.log('Sample location:', adminData.data[0]);
      }
    } else {
      console.log('❌ Admin endpoint failed:', adminResponse.status);
    }

    // Test 5: Create a new location
    console.log('\n5. Testing POST /api/admin/delivery-locations');
    const newLocation = {
      name: 'Test Location',
      tier: 2,
      price: 250,
      description: 'Test location for API testing',
      estimatedDays: 2,
      expressAvailable: true,
      expressPrice: 400
    };

    const createResponse = await fetch(`${API_BASE}/api/admin/delivery-locations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newLocation)
    });

    if (createResponse.ok) {
      const createData = await createResponse.json();
      console.log('✅ Location created:', createData.data?.name);
      
      const locationId = createData.data?.id;
      
      if (locationId) {
        // Test 6: Update the location
        console.log('\n6. Testing PUT /api/admin/delivery-locations/:id');
        const updateResponse = await fetch(`${API_BASE}/api/admin/delivery-locations/${locationId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...newLocation,
            name: 'Updated Test Location',
            price: 300
          })
        });

        if (updateResponse.ok) {
          const updateData = await updateResponse.json();
          console.log('✅ Location updated:', updateData.data?.name, '- Price:', updateData.data?.price);
        } else {
          console.log('❌ Update failed:', updateResponse.status);
        }

        // Test 7: Delete the location
        console.log('\n7. Testing DELETE /api/admin/delivery-locations/:id');
        const deleteResponse = await fetch(`${API_BASE}/api/admin/delivery-locations/${locationId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (deleteResponse.ok) {
          console.log('✅ Location deleted successfully');
        } else {
          console.log('❌ Delete failed:', deleteResponse.status);
        }
      }
    } else {
      console.log('❌ Create failed:', createResponse.status);
      const errorData = await createResponse.json();
      console.log('Error:', errorData);
    }

    console.log('\n🎉 API testing completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDeliveryLocationsAPI();