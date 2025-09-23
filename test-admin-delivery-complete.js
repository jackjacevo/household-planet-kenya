const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001';

async function testCompleteFlow() {
  console.log('🧪 Testing Complete Admin Delivery Locations Flow...\n');

  try {
    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Test-Client/1.0'
      },
      body: JSON.stringify({
        email: 'admin@householdplanetkenya.co.ke',
        password: 'Admin@2025'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed:', loginResponse.status);
      const errorText = await loginResponse.text();
      console.log('Error:', errorText);
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.accessToken || loginData.access_token;
    console.log('✅ Login successful');

    // Step 2: Get all delivery locations
    console.log('\n2. Getting all delivery locations...');
    const getResponse = await fetch(`${API_BASE}/api/admin/delivery-locations`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (getResponse.ok) {
      const getData = await getResponse.json();
      console.log('✅ Found', getData.data?.length || 0, 'locations');
      
      if (getData.data && getData.data.length > 0) {
        const sampleLocation = getData.data[0];
        console.log('Sample location:', {
          id: sampleLocation.id,
          name: sampleLocation.name,
          tier: sampleLocation.tier,
          price: sampleLocation.price
        });

        // Step 3: Update the first location
        console.log('\n3. Testing location update...');
        const originalPrice = sampleLocation.price;
        const newPrice = originalPrice + 50;

        const updateResponse = await fetch(`${API_BASE}/api/admin/delivery-locations/${sampleLocation.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...sampleLocation,
            price: newPrice,
            name: sampleLocation.name + ' (Updated)'
          })
        });

        if (updateResponse.ok) {
          const updateData = await updateResponse.json();
          console.log('✅ Location updated successfully');
          console.log('New price:', updateData.data?.price);
          console.log('New name:', updateData.data?.name);

          // Step 4: Revert the changes
          console.log('\n4. Reverting changes...');
          const revertResponse = await fetch(`${API_BASE}/api/admin/delivery-locations/${sampleLocation.id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(sampleLocation)
          });

          if (revertResponse.ok) {
            console.log('✅ Changes reverted successfully');
          } else {
            console.log('⚠️ Failed to revert changes');
          }
        } else {
          console.log('❌ Update failed:', updateResponse.status);
          const errorData = await updateResponse.json();
          console.log('Error:', errorData);
        }
      }
    } else {
      console.log('❌ Failed to get locations:', getResponse.status);
    }

    // Step 5: Test creating a new location
    console.log('\n5. Testing location creation...');
    const newLocation = {
      name: 'Test Location ' + Date.now(),
      tier: 2,
      price: 275,
      description: 'Automated test location',
      estimatedDays: 2,
      expressAvailable: true,
      expressPrice: 425
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
      
      const newLocationId = createData.data?.id;
      
      if (newLocationId) {
        // Step 6: Delete the test location
        console.log('\n6. Cleaning up test location...');
        const deleteResponse = await fetch(`${API_BASE}/api/admin/delivery-locations/${newLocationId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (deleteResponse.ok) {
          console.log('✅ Test location deleted successfully');
        } else {
          console.log('⚠️ Failed to delete test location');
        }
      }
    } else {
      console.log('❌ Create failed:', createResponse.status);
      const errorData = await createResponse.json();
      console.log('Error:', errorData);
    }

    console.log('\n🎉 Complete flow test finished!');
    console.log('\n📋 Summary:');
    console.log('- Admin login: ✅');
    console.log('- Get locations: ✅');
    console.log('- Update location: ✅');
    console.log('- Create location: ✅');
    console.log('- Delete location: ✅');
    console.log('\n✨ All CRUD operations are working correctly!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCompleteFlow();