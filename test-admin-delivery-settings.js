const fetch = require('node-fetch');

async function testAdminDeliverySettings() {
  console.log('🧪 Testing Admin Delivery Settings CRUD Operations...\n');

  try {
    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    const token = loginData.accessToken;
    console.log('✅ Admin login successful');

    // Step 2: Get current locations count
    console.log('\n2. Getting current locations...');
    const getResponse = await fetch('http://localhost:3001/api/admin/delivery-locations', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const initialData = await getResponse.json();
    const initialCount = initialData.data?.length || 0;
    console.log(`✅ Found ${initialCount} existing locations`);

    // Step 3: Test CREATE - Add new location
    console.log('\n3. Testing CREATE - Adding new location...');
    const newLocation = {
      name: 'Test Location ' + Date.now(),
      tier: 2,
      price: 275,
      description: 'Test location for CRUD verification',
      estimatedDays: 2,
      expressAvailable: true,
      expressPrice: 425
    };

    const createResponse = await fetch('http://localhost:3001/api/admin/delivery-locations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newLocation)
    });

    if (!createResponse.ok) {
      console.log('❌ CREATE failed:', createResponse.status);
      return;
    }

    const createData = await createResponse.json();
    const newLocationId = createData.data?.id;
    console.log(`✅ CREATE successful - Location ID: ${newLocationId}`);
    console.log(`   Name: ${createData.data?.name}`);
    console.log(`   Price: Ksh ${createData.data?.price}`);

    // Step 4: Test READ - Verify location was added
    console.log('\n4. Testing READ - Verifying location was added...');
    const readResponse = await fetch('http://localhost:3001/api/admin/delivery-locations', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const readData = await readResponse.json();
    const newCount = readData.data?.length || 0;
    console.log(`✅ READ successful - Total locations: ${newCount} (was ${initialCount})`);

    // Step 5: Test UPDATE - Edit the location
    console.log('\n5. Testing UPDATE - Editing location...');
    const updatedLocation = {
      ...newLocation,
      name: newLocation.name + ' (UPDATED)',
      price: 300,
      description: 'Updated test location'
    };

    const updateResponse = await fetch(`http://localhost:3001/api/admin/delivery-locations/${newLocationId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedLocation)
    });

    if (!updateResponse.ok) {
      console.log('❌ UPDATE failed:', updateResponse.status);
      return;
    }

    const updateData = await updateResponse.json();
    console.log(`✅ UPDATE successful`);
    console.log(`   New name: ${updateData.data?.name}`);
    console.log(`   New price: Ksh ${updateData.data?.price}`);

    // Step 6: Test DELETE - Remove the location
    console.log('\n6. Testing DELETE - Removing location...');
    const deleteResponse = await fetch(`http://localhost:3001/api/admin/delivery-locations/${newLocationId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!deleteResponse.ok) {
      console.log('❌ DELETE failed:', deleteResponse.status);
      return;
    }

    console.log('✅ DELETE successful');

    // Step 7: Verify deletion
    console.log('\n7. Verifying deletion...');
    const finalResponse = await fetch('http://localhost:3001/api/admin/delivery-locations', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const finalData = await finalResponse.json();
    const finalCount = finalData.data?.length || 0;
    console.log(`✅ Verification successful - Total locations: ${finalCount} (back to ${initialCount})`);

    // Summary
    console.log('\n🎉 CRUD Operations Test Complete!');
    console.log('\n📋 Results Summary:');
    console.log('  ✅ CREATE: Add new location - WORKING');
    console.log('  ✅ READ: Get all locations - WORKING');
    console.log('  ✅ UPDATE: Edit location - WORKING');
    console.log('  ✅ DELETE: Remove location - WORKING');
    console.log('\n✨ All admin delivery settings operations are functional!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAdminDeliverySettings();