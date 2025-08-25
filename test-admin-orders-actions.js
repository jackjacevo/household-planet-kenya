// Test script to verify admin orders actions are working
const API_BASE_URL = 'http://localhost:3001/api';

async function testOrdersActions() {
  console.log('Testing Admin Orders Actions...\n');

  // Test 1: Check if orders endpoint is accessible
  try {
    console.log('1. Testing orders list endpoint...');
    const response = await fetch(`${API_BASE_URL}/orders`, {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE', // Replace with actual token
      },
    });
    
    if (response.ok) {
      console.log('✅ Orders list endpoint is accessible');
      const data = await response.json();
      console.log(`   Found ${data.orders?.length || 0} orders`);
    } else {
      console.log('❌ Orders list endpoint failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Orders list endpoint error:', error.message);
  }

  // Test 2: Check if individual order endpoint is accessible
  try {
    console.log('\n2. Testing individual order endpoint...');
    const response = await fetch(`${API_BASE_URL}/orders/1`, {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE', // Replace with actual token
      },
    });
    
    if (response.ok) {
      console.log('✅ Individual order endpoint is accessible');
    } else {
      console.log('❌ Individual order endpoint failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Individual order endpoint error:', error.message);
  }

  // Test 3: Check if order status update endpoint is accessible
  try {
    console.log('\n3. Testing order status update endpoint...');
    const response = await fetch(`${API_BASE_URL}/orders/1/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE', // Replace with actual token
      },
      body: JSON.stringify({ status: 'CONFIRMED' }),
    });
    
    if (response.ok) {
      console.log('✅ Order status update endpoint is accessible');
    } else {
      console.log('❌ Order status update endpoint failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Order status update endpoint error:', error.message);
  }

  console.log('\n=== Test Complete ===');
  console.log('To run this test:');
  console.log('1. Replace YOUR_TOKEN_HERE with a valid admin token');
  console.log('2. Make sure the backend is running on localhost:3001');
  console.log('3. Run: node test-admin-orders-actions.js');
}

// Instructions for manual testing
console.log('=== Manual Testing Instructions ===');
console.log('1. Login as admin user');
console.log('2. Navigate to /admin/orders');
console.log('3. Test the following actions:');
console.log('   - Click the Eye icon (View) - should navigate to order details');
console.log('   - Click the FileText icon (Edit) - should navigate to order details');
console.log('   - Click the Truck icon (Shipping) - should generate shipping label');
console.log('   - Change status in dropdown - should update order status');
console.log('4. On order details page, test:');
console.log('   - Status dropdown changes');
console.log('   - Add notes functionality');
console.log('   - Email customer functionality');
console.log('   - Generate shipping label');
console.log('\n');

// Uncomment to run the automated test
// testOrdersActions();