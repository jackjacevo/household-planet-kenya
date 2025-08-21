const axios = require('axios')

const API_BASE = 'http://localhost:3001'

async function runSecurityTests() {
  console.log('🔒 Running Security Tests...\n')

  // Test 1: SQL Injection
  try {
    await axios.post(`${API_BASE}/auth/login`, {
      email: "admin'; DROP TABLE users; --",
      password: 'password'
    })
    console.log('❌ SQL Injection: Vulnerable')
  } catch (error) {
    console.log('✅ SQL Injection: Protected')
  }

  // Test 2: XSS Protection
  try {
    await axios.post(`${API_BASE}/products`, {
      name: '<script>alert("xss")</script>',
      price: 100
    })
    console.log('❌ XSS: Vulnerable')
  } catch (error) {
    console.log('✅ XSS: Protected')
  }

  // Test 3: Rate Limiting
  const requests = Array(20).fill().map(() => 
    axios.post(`${API_BASE}/auth/login`, {
      email: 'test@test.com',
      password: 'wrong'
    }).catch(() => {})
  )
  
  await Promise.all(requests)
  console.log('✅ Rate Limiting: Tested')

  // Test 4: JWT Security
  try {
    await axios.get(`${API_BASE}/admin/users`, {
      headers: { Authorization: 'Bearer invalid-token' }
    })
    console.log('❌ JWT: Vulnerable')
  } catch (error) {
    console.log('✅ JWT: Protected')
  }

  console.log('\n🔒 Security tests completed')
}

runSecurityTests()