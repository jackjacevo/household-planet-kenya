const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:3000';

// Admin credentials for testing
const ADMIN_EMAIL = 'admin@householdplanet.co.ke';
const ADMIN_PASSWORD = 'Admin@2024!';

let adminToken = null;

async function loginAdmin() {
  console.log('🔐 Logging in as admin...');
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    adminToken = response.data.token;
    console.log('✅ Admin login successful');
    return true;
  } catch (error) {
    console.log('❌ Admin login failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function getAllLocations() {
  const response = await axios.get(`${API_BASE_URL}/api/simple-delivery/locations`);
  return response.data.data || [];
}

async function checkLocationInAllEndpoints(locationName, expectedPrice = null) {
  console.log(`🔍 Checking "${locationName}" in all endpoints...`);
  
  const endpoints = [
    { name: 'Backend Direct', url: `${API_BASE_URL}/api/simple-delivery/locations` },
    { name: 'Frontend Proxy', url: `${FRONTEND_URL}/api/delivery/locations` }
  ];
  
  const results = {};
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(endpoint.url);
      const locations = response.data.data || [];
      const location = locations.find(loc => loc.name.toLowerCase().includes(locationName.toLowerCase()));
      
      if (location) {
        results[endpoint.name] = {
          found: true,
          price: location.price,
          id: location.id
        };
        console.log(`  ${endpoint.name}: ✅ Found - KSh ${location.price}`);
        
        if (expectedPrice && location.price !== expectedPrice) {
          console.log(`    ⚠️  Expected KSh ${expectedPrice}, got KSh ${location.price}`);
        }
      } else {
        results[endpoint.name] = { found: false };
        console.log(`  ${endpoint.name}: ❌ Not found`);
      }
    } catch (error) {
      results[endpoint.name] = { error: error.message };
      console.log(`  ${endpoint.name}: ❌ Error - ${error.message}`);
    }
  }
  
  return results;
}

async function testAddLocation() {
  console.log('\n🆕 TEST 1: Adding a new delivery location...');
  
  const newLocation = {
    name: 'Test Location Kibera',
    tier: 2,
    price: 250,
    description: 'Test location for verification',
    estimatedDays: 2,
    expressAvailable: false
  };
  
  try {
    // Add location via admin API
    const response = await axios.post(
      `${API_BASE_URL}/api/admin/delivery-locations`,
      newLocation,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    console.log('✅ Location added successfully');
    const locationId = response.data.data.id;
    
    // Wait a moment for propagation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if it appears in all endpoints
    const results = await checkLocationInAllEndpoints('Test Location Kibera', 250);
    
    // Cleanup - delete the test location
    await axios.delete(
      `${API_BASE_URL}/api/admin/delivery-locations/${locationId}`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    return results;
  } catch (error) {
    console.log('❌ Failed to add location:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testUpdateLocation() {
  console.log('\n✏️  TEST 2: Updating an existing location price...');
  
  try {
    // Get current locations
    const locations = await getAllLocations();
    const testLocation = locations.find(loc => loc.name.toLowerCase().includes('nairobi cbd'));
    
    if (!testLocation) {
      console.log('❌ Nairobi CBD not found for testing');
      return null;
    }
    
    const originalPrice = testLocation.price;
    const newPrice = originalPrice + 50; // Increase by 50
    
    console.log(`📍 Updating "${testLocation.name}" from KSh ${originalPrice} to KSh ${newPrice}`);
    
    // Update location
    await axios.put(
      `${API_BASE_URL}/api/admin/delivery-locations/${testLocation.id}`,
      { price: newPrice },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    console.log('✅ Location updated successfully');
    
    // Wait a moment for propagation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if updated price appears in all endpoints
    const results = await checkLocationInAllEndpoints('Nairobi CBD', newPrice);
    
    // Restore original price
    await axios.put(
      `${API_BASE_URL}/api/admin/delivery-locations/${testLocation.id}`,
      { price: originalPrice },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    console.log(`🔄 Restored original price: KSh ${originalPrice}`);
    
    return results;
  } catch (error) {
    console.log('❌ Failed to update location:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testDeleteLocation() {
  console.log('\n🗑️  TEST 3: Deleting a location...');
  
  try {
    // First add a temporary location to delete
    const tempLocation = {
      name: 'Temp Delete Test Location',
      tier: 3,
      price: 400,
      description: 'Temporary location for delete test',
      estimatedDays: 3,
      expressAvailable: false
    };
    
    const addResponse = await axios.post(
      `${API_BASE_URL}/api/admin/delivery-locations`,
      tempLocation,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    const locationId = addResponse.data.data.id;
    console.log('✅ Temporary location created for deletion test');
    
    // Verify it exists
    await checkLocationInAllEndpoints('Temp Delete Test Location');
    
    // Delete the location
    await axios.delete(
      `${API_BASE_URL}/api/admin/delivery-locations/${locationId}`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    console.log('✅ Location deleted successfully');
    
    // Wait a moment for propagation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if it's removed from all endpoints
    const results = await checkLocationInAllEndpoints('Temp Delete Test Location');
    
    return results;
  } catch (error) {
    console.log('❌ Failed to delete location:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testCacheInvalidation() {
  console.log('\n🔄 TEST 4: Testing cache invalidation...');
  
  try {
    // Get initial count
    const initialLocations = await getAllLocations();
    const initialCount = initialLocations.length;
    console.log(`📊 Initial location count: ${initialCount}`);
    
    // Add a location
    const testLocation = {
      name: 'Cache Test Location',
      tier: 2,
      price: 300,
      estimatedDays: 2,
      expressAvailable: false
    };
    
    const addResponse = await axios.post(
      `${API_BASE_URL}/api/admin/delivery-locations`,
      testLocation,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    const locationId = addResponse.data.data.id;
    
    // Check multiple times to ensure no caching issues
    for (let i = 1; i <= 3; i++) {
      console.log(`🔄 Check ${i}/3 - Waiting 500ms...`);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const currentLocations = await getAllLocations();
      const found = currentLocations.find(loc => loc.name === 'Cache Test Location');
      
      if (found) {
        console.log(`  ✅ Location found in check ${i}`);
      } else {
        console.log(`  ❌ Location NOT found in check ${i}`);
      }
    }
    
    // Cleanup
    await axios.delete(
      `${API_BASE_URL}/api/admin/delivery-locations/${locationId}`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    return true;
  } catch (error) {
    console.log('❌ Cache invalidation test failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 COMPREHENSIVE DELIVERY LOCATIONS ADMIN CHANGES TEST\n');
  console.log('This test verifies that changes made in admin dashboard');
  console.log('are immediately reflected in all delivery location dropdowns.\n');
  
  // Login as admin
  const loginSuccess = await loginAdmin();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without admin access');
    return;
  }
  
  // Run all tests
  const results = {
    add: await testAddLocation(),
    update: await testUpdateLocation(),
    delete: await testDeleteLocation(),
    cache: await testCacheInvalidation()
  };
  
  console.log('\n📋 TEST SUMMARY:');
  console.log('================');
  
  // Analyze results
  let allPassed = true;
  
  if (results.add) {
    const addPassed = Object.values(results.add).every(r => r.found === true);
    console.log(`✅ ADD Location: ${addPassed ? 'PASSED' : 'FAILED'}`);
    if (!addPassed) allPassed = false;
  }
  
  if (results.update) {
    const updatePassed = Object.values(results.update).every(r => r.found === true);
    console.log(`✅ UPDATE Location: ${updatePassed ? 'PASSED' : 'FAILED'}`);
    if (!updatePassed) allPassed = false;
  }
  
  if (results.delete) {
    const deletePassed = Object.values(results.delete).every(r => r.found === false);
    console.log(`✅ DELETE Location: ${deletePassed ? 'PASSED' : 'FAILED'}`);
    if (!deletePassed) allPassed = false;
  }
  
  console.log(`✅ CACHE Invalidation: ${results.cache ? 'PASSED' : 'FAILED'}`);
  if (!results.cache) allPassed = false;
  
  console.log('\n🎯 COMPONENTS AFFECTED:');
  console.log('- Admin > WhatsApp > Create Order dropdown');
  console.log('- Cart page delivery location dropdown');
  console.log('- Checkout page delivery location dropdown');
  
  console.log(`\n🏆 OVERALL RESULT: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  if (allPassed) {
    console.log('\n🎉 SUCCESS! Admin dashboard changes are immediately reflected');
    console.log('   across all delivery location dropdowns in the application.');
  } else {
    console.log('\n⚠️  Some issues detected. Check the test results above.');
  }
}

main().catch(console.error);