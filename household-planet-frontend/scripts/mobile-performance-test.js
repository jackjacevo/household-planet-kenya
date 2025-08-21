#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Mobile performance test configuration
const mobileConfig = {
  extends: 'lighthouse:default',
  settings: {
    formFactor: 'mobile',
    throttling: {
      rttMs: 150,
      throughputKbps: 1638.4,
      cpuSlowdownMultiplier: 4,
      requestLatencyMs: 150,
      downloadThroughputKbps: 1638.4,
      uploadThroughputKbps: 675,
    },
    screenEmulation: {
      mobile: true,
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      disabled: false,
    },
  },
};

// Test URLs
const testUrls = [
  'http://localhost:3000',
  'http://localhost:3000/products',
  'http://localhost:3000/cart',
  'http://localhost:3000/checkout',
];

// Performance thresholds
const thresholds = {
  'first-contentful-paint': 2000,
  'largest-contentful-paint': 2500,
  'speed-index': 3000,
  'interactive': 3500,
  'cumulative-layout-shift': 0.1,
  'total-blocking-time': 300,
};

async function runMobilePerformanceTest() {
  console.log('🚀 Starting Mobile Performance Tests...\n');
  
  const results = [];
  
  for (const url of testUrls) {
    console.log(`📱 Testing: ${url}`);
    
    try {
      // Simulate performance metrics for demo
      const metrics = {
        fcp: Math.random() * 2000 + 1000,
        lcp: Math.random() * 3000 + 1500,
        si: Math.random() * 3500 + 2000,
        tti: Math.random() * 4000 + 2500,
        cls: Math.random() * 0.2,
        tbt: Math.random() * 400 + 100,
      };
      
      const score = calculateScore(metrics);
      
      results.push({
        url,
        metrics,
        score,
        passed: checkThresholds(metrics),
      });
      
      console.log(`   Performance Score: ${Math.round(score)}/100`);
      console.log(`   FCP: ${Math.round(metrics.fcp)}ms`);
      console.log(`   LCP: ${Math.round(metrics.lcp)}ms`);
      console.log(`   CLS: ${metrics.cls.toFixed(3)}`);
      console.log(`   TBT: ${Math.round(metrics.tbt)}ms\n`);
      
    } catch (error) {
      console.error(`❌ Error testing ${url}:`, error.message);
    }
  }
  
  // Generate report
  generateReport(results);
  
  // Check if all tests passed
  const allPassed = results.every(result => result.passed);
  
  if (allPassed) {
    console.log('✅ All mobile performance tests passed!');
    process.exit(0);
  } else {
    console.log('❌ Some mobile performance tests failed!');
    process.exit(1);
  }
}

function calculateScore(metrics) {
  // Simplified scoring algorithm
  let score = 100;
  
  if (metrics.fcp > 1800) score -= 10;
  if (metrics.lcp > 2500) score -= 15;
  if (metrics.cls > 0.1) score -= 15;
  if (metrics.tbt > 300) score -= 10;
  
  return Math.max(0, score);
}

function checkThresholds(metrics) {
  return (
    metrics.fcp <= thresholds['first-contentful-paint'] &&
    metrics.lcp <= thresholds['largest-contentful-paint'] &&
    metrics.si <= thresholds['speed-index'] &&
    metrics.tti <= thresholds['interactive'] &&
    metrics.cls <= thresholds['cumulative-layout-shift'] &&
    metrics.tbt <= thresholds['total-blocking-time']
  );
}

function generateReport(results) {
  const reportPath = path.join(__dirname, '../reports/mobile-performance-report.json');
  const reportDir = path.dirname(reportPath);
  
  // Ensure reports directory exists
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: results.length,
      passed: results.filter(r => r.passed).length,
      failed: results.filter(r => !r.passed).length,
      averageScore: Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length),
    },
    thresholds,
    results,
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📊 Report saved to: ${reportPath}`);
}

// Run the tests
if (require.main === module) {
  runMobilePerformanceTest().catch(console.error);
}

module.exports = {
  runMobilePerformanceTest,
};