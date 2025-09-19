// Test script to check what user data is stored in frontend
console.log('=== FRONTEND USER DATA TEST ===');

// Check localStorage token
const token = localStorage.getItem('token');
if (token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('JWT Payload:', {
      role: payload.role,
      email: payload.email,
      sub: payload.sub
    });
  } catch (e) {
    console.log('Invalid token format');
  }
} else {
  console.log('No token found');
}

// Check if user is logged in
console.log('Current URL:', window.location.href);
console.log('User should see admin dashboard link if role is SUPER_ADMIN');