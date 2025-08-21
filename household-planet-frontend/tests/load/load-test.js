import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200
    { duration: '5m', target: 200 }, // Stay at 200
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.1'],    // Error rate under 10%
  },
}

export default function () {
  // Test homepage
  let response = http.get('http://localhost:3000')
  check(response, {
    'homepage loads': (r) => r.status === 200,
    'homepage has content': (r) => r.body.includes('Household Planet'),
  })

  sleep(1)

  // Test products page
  response = http.get('http://localhost:3000/products')
  check(response, {
    'products page loads': (r) => r.status === 200,
  })

  sleep(1)

  // Test API endpoint
  response = http.get('http://localhost:3001/api/products')
  check(response, {
    'API responds': (r) => r.status === 200,
    'API returns JSON': (r) => r.headers['Content-Type'].includes('application/json'),
  })

  sleep(1)
}