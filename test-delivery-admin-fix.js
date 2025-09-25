const BASE_URL = 'https://householdplanetkenya.co.ke';

async function testDeliveryAdminFix() {
  console.log('🧪 Testing Delivery Admin API Fix...\n');

  // Test the old problematic URL (should be 404)
  console.log('1️⃣ Testing old problematic URL...');
  try {
    const oldResponse = await fetch(`${BASE_URL}/api/api/delivery/admin/orders`);
    console.log(`Old URL: ${oldResponse.status} ${oldResponse.statusText}`);
    if (oldResponse.status === 404) {
      console.log('✅ Old URL correctly returns 404 (fixed!)');
    } else {
      console.log('⚠️ Old URL still accessible');
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }

  // Test the correct URL (should be 401 or accessible)
  console.log('\n2️⃣ Testing correct URL...');
  try {
    const correctResponse = await fetch(`${BASE_URL}/api/delivery/admin/orders`);
    console.log(`Correct URL: ${correctResponse.status} ${correctResponse.statusText}`);
    if (correctResponse.status === 401) {
      console.log('✅ Correct URL exists (requires authentication)');
    } else if (correctResponse.status === 404) {
      console.log('❌ Correct URL not found - may need backend endpoint');
    } else {
      console.log('✅ Correct URL accessible');
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }

  console.log('\n🎉 Delivery admin API fix test completed!');
}

testDeliveryAdminFix();