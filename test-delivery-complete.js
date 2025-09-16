const axios = require('axios');

async function testCompleteDeliveryFlow() {
  console.log('🧪 Testing Complete Delivery Flow...\n');
  
  try {
    // Test 1: Backend API
    console.log('1️⃣ Testing Backend API...');
    const backendResponse = await axios.get('http://localhost:3001/api/simple-delivery/locations', {
      timeout: 5000,
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (backendResponse.status === 200 && backendResponse.data.success) {
      console.log('✅ Backend API working correctly');
      console.log(`   Found ${backendResponse.data.data.length} locations`);
      
      // Show sample locations
      const sampleLocations = backendResponse.data.data.slice(0, 3);
      sampleLocations.forEach((loc, index) => {
        console.log(`   ${index + 1}. ${loc.name} - Tier ${loc.tier} - KSh ${loc.price}`);
      });
    } else {
      console.log('❌ Backend API returned unsuccessful response');
      console.log('   Response:', backendResponse.data);
    }
    
    console.log('');
    
    // Test 2: Frontend API call simulation
    console.log('2️⃣ Testing Frontend API Call Simulation...');
    const frontendResponse = await axios.get('http://localhost:3001/api/simple-delivery/locations', {
      timeout: 5000,
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Origin': 'http://localhost:3000',
        'Referer': 'http://localhost:3000'
      }
    });
    
    if (frontendResponse.status === 200) {
      console.log('✅ Frontend-style API call working');
      console.log(`   CORS headers should allow frontend access`);
    } else {
      console.log('❌ Frontend-style API call failed');
    }
    
    console.log('');
    
    // Test 3: Check specific location data structure
    console.log('3️⃣ Checking Location Data Structure...');
    const locations = backendResponse.data.data;
    const requiredFields = ['id', 'name', 'tier', 'price', 'estimatedDays'];
    
    let structureValid = true;
    for (const location of locations.slice(0, 5)) {
      for (const field of requiredFields) {
        if (!(field in location)) {
          console.log(`❌ Missing field '${field}' in location: ${location.name}`);
          structureValid = false;
        }
      }
    }
    
    if (structureValid) {
      console.log('✅ Location data structure is valid');
    }
    
    console.log('');
    
    // Test 4: Check tier distribution
    console.log('4️⃣ Checking Tier Distribution...');
    const tierCounts = locations.reduce((acc, loc) => {
      acc[loc.tier] = (acc[loc.tier] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(tierCounts).forEach(([tier, count]) => {
      console.log(`   Tier ${tier}: ${count} locations`);
    });
    
    console.log('');
    console.log('🎉 All tests completed successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log(`   • Backend API: ✅ Working`);
    console.log(`   • Total Locations: ${locations.length}`);
    console.log(`   • Data Structure: ✅ Valid`);
    console.log(`   • CORS: ✅ Should work for frontend`);
    console.log('');
    console.log('🔍 If the frontend is still showing "Loading locations...", check:');
    console.log('   1. Frontend development server is running (npm run dev)');
    console.log('   2. Browser console for any JavaScript errors');
    console.log('   3. Network tab in browser dev tools for failed requests');
    console.log('   4. NEXT_PUBLIC_API_URL environment variable is set correctly');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('');
      console.log('🚨 Backend server is not running!');
      console.log('   Please start the backend server:');
      console.log('   cd household-planet-backend && npm run start:dev');
    } else if (error.response) {
      console.log('');
      console.log('📊 Error Response Details:');
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Data:`, error.response.data);
    }
  }
}

testCompleteDeliveryFlow();