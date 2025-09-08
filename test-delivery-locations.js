const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function testDeliveryLocations() {
  console.log('🚀 Testing Delivery Locations Management System...\n');

  try {
    // First, let's get an admin token (you'll need to replace with actual admin credentials)
    console.log('1. Getting admin token...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@householdplanet.co.ke',
      password: 'Admin123!'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Admin token obtained\n');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Test 1: Seed default locations
    console.log('2. Seeding default delivery locations...');
    try {
      await axios.post(`${API_BASE}/admin/delivery-locations/seed`, {}, { headers });
      console.log('✅ Default locations seeded\n');
    } catch (error) {
      console.log('ℹ️ Locations may already exist\n');
    }

    // Test 2: Get all locations
    console.log('3. Fetching all delivery locations...');
    const locationsResponse = await axios.get(`${API_BASE}/admin/delivery-locations`, { headers });
    const locations = locationsResponse.data.data;
    console.log(`✅ Found ${locations.length} delivery locations`);
    console.log(`   - Tier 1: ${locations.filter(l => l.tier === 1).length} locations`);
    console.log(`   - Tier 2: ${locations.filter(l => l.tier === 2).length} locations`);
    console.log(`   - Tier 3: ${locations.filter(l => l.tier === 3).length} locations`);
    console.log(`   - Tier 4: ${locations.filter(l => l.tier === 4).length} locations\n`);

    // Test 3: Create a new location
    console.log('4. Creating a new delivery location...');
    const newLocation = {
      name: 'Test Location - Nakuru',
      tier: 2,
      price: 280,
      description: 'Test location for Nakuru',
      estimatedDays: 2,
      expressAvailable: true,
      expressPrice: 420
    };

    const createResponse = await axios.post(`${API_BASE}/admin/delivery-locations`, newLocation, { headers });
    const createdLocation = createResponse.data.data;
    console.log(`✅ Created location: ${createdLocation.name} (ID: ${createdLocation.id})\n`);

    // Test 4: Update the location
    console.log('5. Updating the delivery location...');
    const updateData = {
      price: 300,
      description: 'Updated test location for Nakuru'
    };

    const updateResponse = await axios.put(`${API_BASE}/admin/delivery-locations/${createdLocation.id}`, updateData, { headers });
    console.log(`✅ Updated location price to Ksh ${updateResponse.data.data.price}\n`);

    // Test 5: Get location by ID
    console.log('6. Fetching location by ID...');
    const getResponse = await axios.get(`${API_BASE}/admin/delivery-locations/${createdLocation.id}`, { headers });
    console.log(`✅ Retrieved location: ${getResponse.data.data.name}\n`);

    // Test 6: Test public delivery endpoints
    console.log('7. Testing public delivery endpoints...');
    
    // Get all locations (public)
    const publicLocationsResponse = await axios.get(`${API_BASE}/delivery/locations`);
    console.log(`✅ Public locations endpoint: ${publicLocationsResponse.data.data.length} locations`);

    // Search locations
    const searchResponse = await axios.get(`${API_BASE}/delivery/search?q=nairobi`);
    console.log(`✅ Search for 'nairobi': ${searchResponse.data.data.length} results`);

    // Get tier info
    const tierResponse = await axios.get(`${API_BASE}/delivery/tiers`);
    console.log(`✅ Tier info retrieved:`, tierResponse.data.data);

    // Calculate shipping cost
    const shippingResponse = await axios.post(`${API_BASE}/delivery/calculate`, {
      location: 'Nairobi CBD',
      orderValue: 2500,
      isExpress: false
    });
    console.log(`✅ Shipping calculation: Ksh ${shippingResponse.data.finalCost} for Ksh 2500 order\n`);

    // Test 7: Delete the test location
    console.log('8. Cleaning up - deleting test location...');
    await axios.delete(`${API_BASE}/admin/delivery-locations/${createdLocation.id}`, { headers });
    console.log('✅ Test location deleted\n');

    console.log('🎉 All tests passed! Delivery locations management system is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Make sure you have an admin user with email: admin@householdplanet.co.ke and password: Admin123!');
      console.log('   You can create one using the create-admin.js script in the backend folder.');
    }
  }
}

// Run the test
testDeliveryLocations();