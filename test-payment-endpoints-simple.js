/**
 * Simple Payment API Endpoint Test
 * Tests if the payment endpoints are accessible (without authentication)
 */

const BASE_URL = 'https://householdplanetkenya.co.ke';

async function testEndpointAccessibility() {
  console.log('🧪 Testing Payment API Endpoint Accessibility...\n');

  const endpoints = [
    '/api/payments/admin/stats',
    '/api/payments/admin/transactions',
    '/api/payments/admin/refund',
    '/api/payments/admin/cash-payment'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`🔍 Testing: ${endpoint}`);
      
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.status === 401) {
        console.log('   ✅ Endpoint exists (requires authentication)');
      } else if (response.status === 404) {
        console.log('   ❌ Endpoint not found (404 error)');
      } else if (response.status === 500) {
        console.log('   ⚠️  Server error (500)');
      } else {
        console.log('   ✅ Endpoint accessible');
      }
      
    } catch (error) {
      console.log(`   ❌ Network error: ${error.message}`);
    }
    
    console.log('');
  }

  // Test the old problematic URLs to confirm they're fixed
  console.log('🔍 Testing old problematic URLs (should be 404):');
  
  const oldUrls = [
    '/api/api/payments/admin/stats',
    '/api/api/payments/admin/transactions'
  ];

  for (const url of oldUrls) {
    try {
      console.log(`🔍 Testing old URL: ${url}`);
      
      const response = await fetch(`${BASE_URL}${url}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.status === 404) {
        console.log('   ✅ Old URL correctly returns 404 (fixed!)');
      } else {
        console.log('   ⚠️  Old URL still accessible (may need more fixes)');
      }
      
    } catch (error) {
      console.log(`   ❌ Network error: ${error.message}`);
    }
    
    console.log('');
  }

  console.log('🎉 Endpoint accessibility test completed!');
}

// Run the test
testEndpointAccessibility();