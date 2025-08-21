import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate } from 'k6/metrics'

const errorRate = new Rate('errors')

export const options = {
  stages: [
    { duration: '5m', target: 100 },   // Ramp up
    { duration: '10m', target: 500 },  // Medium load
    { duration: '5m', target: 1000 },  // High load
    { duration: '10m', target: 1000 }, // Sustained load
    { duration: '5m', target: 1500 },  // Stress test
    { duration: '5m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000', 'p(99)<5000'],
    http_req_failed: ['rate<0.05'],
    errors: ['rate<0.1'],
  },
}

const BASE_URL = 'https://householdplanet.co.ke'

export default function () {
  // Homepage load test
  let response = http.get(`${BASE_URL}/`)
  check(response, {
    'homepage status 200': (r) => r.status === 200,
    'homepage loads fast': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1)

  sleep(1)

  // Product listing load test
  response = http.get(`${BASE_URL}/products`)
  check(response, {
    'products status 200': (r) => r.status === 200,
    'products loads fast': (r) => r.timings.duration < 3000,
  }) || errorRate.add(1)

  sleep(1)

  // API load test
  response = http.get(`${BASE_URL}/api/products?limit=20`)
  check(response, {
    'API status 200': (r) => r.status === 200,
    'API response fast': (r) => r.timings.duration < 1000,
    'API returns data': (r) => JSON.parse(r.body).length > 0,
  }) || errorRate.add(1)

  sleep(2)

  // Search functionality
  response = http.get(`${BASE_URL}/api/products/search?q=kitchen`)
  check(response, {
    'search works': (r) => r.status === 200,
    'search fast': (r) => r.timings.duration < 1500,
  }) || errorRate.add(1)

  sleep(1)
}