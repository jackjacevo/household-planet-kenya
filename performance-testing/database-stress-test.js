import http from 'k6/http'
import { check } from 'k6'

export const options = {
  scenarios: {
    database_reads: {
      executor: 'constant-vus',
      vus: 200,
      duration: '10m',
    },
    database_writes: {
      executor: 'constant-vus',
      vus: 50,
      duration: '10m',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.02'],
  },
}

const API_BASE = 'http://localhost:3001/api'

export default function () {
  // Heavy database read operations
  const readTests = [
    `${API_BASE}/products?page=1&limit=50`,
    `${API_BASE}/products/search?q=kitchen&limit=20`,
    `${API_BASE}/categories`,
    `${API_BASE}/products/1`,
    `${API_BASE}/reviews?productId=1`,
  ]

  readTests.forEach(url => {
    const response = http.get(url)
    check(response, {
      'DB read successful': (r) => r.status === 200,
      'DB read fast': (r) => r.timings.duration < 2000,
    })
  })

  // Simulate write operations (less frequent)
  if (Math.random() < 0.1) {
    const writeResponse = http.post(`${API_BASE}/cart`, {
      productId: Math.floor(Math.random() * 100) + 1,
      quantity: Math.floor(Math.random() * 5) + 1,
    })
    
    check(writeResponse, {
      'DB write successful': (r) => r.status === 201,
      'DB write acceptable': (r) => r.timings.duration < 3000,
    })
  }
}