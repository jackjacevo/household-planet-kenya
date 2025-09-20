// Simple test to check authentication status
// Open browser console and run this script

console.log('=== Authentication Status Check ===');

// Check localStorage
const token = localStorage.getItem('token');
console.log('Token exists:', !!token);

if (token) {
  console.log('Token length:', token.length);
  console.log('Token preview:', token.substring(0, 50) + '...');
  
  try {
    // Decode JWT payload
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      console.log('Token payload:', payload);
      
      const isExpired = payload.exp * 1000 < Date.now();
      console.log('Token expired:', isExpired);
      console.log('Expires at:', new Date(payload.exp * 1000).toLocaleString());
      
      if (payload.role) {
        console.log('User role:', payload.role);
        console.log('Is admin:', payload.role === 'ADMIN' || payload.role === 'SUPER_ADMIN');
      }
    }
  } catch (error) {
    console.error('Error decoding token:', error);
  }
}

// Test API call
if (token) {
  console.log('\n=== Testing API Call ===');
  
  fetch('https://api.householdplanetkenya.co.ke/api/admin/dashboard', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log('API Response status:', response.status);
    console.log('API Response statusText:', response.statusText);
    return response.text();
  })
  .then(data => {
    console.log('API Response data:', data);
  })
  .catch(error => {
    console.error('API Error:', error);
  });
}

console.log('\n=== Instructions ===');
console.log('1. If no token exists, you need to log in');
console.log('2. If token is expired, you need to log in again');
console.log('3. If user role is not ADMIN/SUPER_ADMIN, you need admin access');
console.log('4. If API call fails with 403, check user permissions');