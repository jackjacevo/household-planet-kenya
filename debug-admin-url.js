// Debug script to check for malformed URLs
console.log('Environment variables:');
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);

// Check for common malformed URL patterns
const testUrls = [
  'http://localhost:3000/admin/[',
  'http://localhost:3000/admin/[id]',
  'http://localhost:3001/api/admin/[',
];

testUrls.forEach(url => {
  console.log(`Testing URL: ${url}`);
  try {
    new URL(url);
    console.log('✅ Valid URL');
  } catch (error) {
    console.log('❌ Invalid URL:', error.message);
  }
});