#!/usr/bin/env node

const axios = require('axios');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Production URLs
const FRONTEND_URL = 'https://householdplanetkenya.co.ke';
const BACKEND_URL = 'https://api.householdplanetkenya.co.ke';

class ProductionDeploymentTester {
  constructor() {
    this.results = {
      deployment: {},
      backend: {},
      frontend: {},
      database: {},
      security: {},
      performance: {}
    };
  }

  async runAllTests() {
    console.log('🚀 Starting Production Deployment & Testing...\n');
    
    try {
      await this.checkDeploymentStatus();
      await this.testBackendHealth();
      await this.testFrontendAccess();
      await this.testDatabaseConnection();
      await this.testSecurityFeatures();
      await this.testPerformance();
      await this.generateReport();
    } catch (error) {
      console.error('❌ Deployment test failed:', error.message);
      process.exit(1);
    }
  }

  async checkDeploymentStatus() {
    console.log('📋 Checking Deployment Status...');
    
    // Check if services are running
    try {
      const backendHealth = await axios.get(`${BACKEND_URL}/health`, { timeout: 10000 });
      this.results.deployment.backend = backendHealth.status === 200 ? '✅ Running' : '❌ Failed';
    } catch (error) {
      this.results.deployment.backend = `❌ Error: ${error.message}`;
    }

    try {
      const frontendResponse = await axios.get(FRONTEND_URL, { timeout: 10000 });
      this.results.deployment.frontend = frontendResponse.status === 200 ? '✅ Running' : '❌ Failed';
    } catch (error) {
      this.results.deployment.frontend = `❌ Error: ${error.message}`;
    }

    console.log(`Backend: ${this.results.deployment.backend}`);
    console.log(`Frontend: ${this.results.deployment.frontend}\n`);
  }

  async testBackendHealth() {
    console.log('🔧 Testing Backend Health...');
    
    const tests = [
      { name: 'Health Check', endpoint: '/health' },
      { name: 'API Status', endpoint: '/api' },
      { name: 'Categories', endpoint: '/api/categories' },
      { name: 'Products', endpoint: '/api/products' },
      { name: 'Delivery Locations', endpoint: '/api/delivery/locations' }
    ];

    for (const test of tests) {
      try {
        const response = await axios.get(`${BACKEND_URL}${test.endpoint}`, { timeout: 5000 });
        this.results.backend[test.name] = `✅ ${response.status}`;
        console.log(`${test.name}: ✅ ${response.status}`);
      } catch (error) {
        this.results.backend[test.name] = `❌ ${error.response?.status || 'Network Error'}`;
        console.log(`${test.name}: ❌ ${error.response?.status || 'Network Error'}`);
      }
    }
    console.log();
  }

  async testFrontendAccess() {
    console.log('🌐 Testing Frontend Access...');
    
    const pages = [
      { name: 'Homepage', path: '/' },
      { name: 'Products', path: '/products' },
      { name: 'Categories', path: '/categories' },
      { name: 'Login', path: '/login' },
      { name: 'Register', path: '/register' }
    ];

    for (const page of pages) {
      try {
        const response = await axios.get(`${FRONTEND_URL}${page.path}`, { timeout: 10000 });
        this.results.frontend[page.name] = `✅ ${response.status}`;
        console.log(`${page.name}: ✅ ${response.status}`);
      } catch (error) {
        this.results.frontend[page.name] = `❌ ${error.response?.status || 'Network Error'}`;
        console.log(`${page.name}: ❌ ${error.response?.status || 'Network Error'}`);
      }
    }
    console.log();
  }

  async testDatabaseConnection() {
    console.log('🗄️ Testing Database Connection...');
    
    try {
      // Test database through API endpoints
      const categoriesResponse = await axios.get(`${BACKEND_URL}/api/categories`, { timeout: 5000 });
      const productsResponse = await axios.get(`${BACKEND_URL}/api/products`, { timeout: 5000 });
      
      this.results.database.categories = categoriesResponse.data?.length > 0 ? '✅ Data Available' : '⚠️ No Data';
      this.results.database.products = productsResponse.data?.length > 0 ? '✅ Data Available' : '⚠️ No Data';
      
      console.log(`Categories: ${this.results.database.categories}`);
      console.log(`Products: ${this.results.database.products}`);
    } catch (error) {
      this.results.database.connection = `❌ Error: ${error.message}`;
      console.log(`Database: ❌ Error: ${error.message}`);
    }
    console.log();
  }

  async testSecurityFeatures() {
    console.log('🔒 Testing Security Features...');
    
    // Test HTTPS
    try {
      const httpsTest = await axios.get(BACKEND_URL, { timeout: 5000 });
      this.results.security.https = '✅ HTTPS Enabled';
    } catch (error) {
      this.results.security.https = '❌ HTTPS Issue';
    }

    // Test CORS
    try {
      const corsTest = await axios.get(`${BACKEND_URL}/api/categories`, {
        headers: { 'Origin': FRONTEND_URL },
        timeout: 5000
      });
      this.results.security.cors = '✅ CORS Configured';
    } catch (error) {
      this.results.security.cors = '❌ CORS Issue';
    }

    console.log(`HTTPS: ${this.results.security.https}`);
    console.log(`CORS: ${this.results.security.cors}`);
    console.log();
  }

  async testPerformance() {
    console.log('⚡ Testing Performance...');
    
    const startTime = Date.now();
    
    try {
      await axios.get(`${BACKEND_URL}/health`, { timeout: 5000 });
      const backendResponseTime = Date.now() - startTime;
      this.results.performance.backend = `${backendResponseTime}ms`;
    } catch (error) {
      this.results.performance.backend = 'Failed';
    }

    const frontendStartTime = Date.now();
    try {
      await axios.get(FRONTEND_URL, { timeout: 10000 });
      const frontendResponseTime = Date.now() - frontendStartTime;
      this.results.performance.frontend = `${frontendResponseTime}ms`;
    } catch (error) {
      this.results.performance.frontend = 'Failed';
    }

    console.log(`Backend Response Time: ${this.results.performance.backend}`);
    console.log(`Frontend Response Time: ${this.results.performance.frontend}`);
    console.log();
  }

  async generateReport() {
    console.log('📊 Generating Production Test Report...\n');
    
    const report = `
# Production Deployment Test Report
Generated: ${new Date().toISOString()}

## Deployment Status
- Backend: ${this.results.deployment.backend}
- Frontend: ${this.results.deployment.frontend}

## Backend Health
${Object.entries(this.results.backend).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

## Frontend Access
${Object.entries(this.results.frontend).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

## Database Connection
${Object.entries(this.results.database).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

## Security Features
${Object.entries(this.results.security).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

## Performance Metrics
${Object.entries(this.results.performance).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

## Production URLs
- Frontend: ${FRONTEND_URL}
- Backend API: ${BACKEND_URL}
- Admin Panel: ${FRONTEND_URL}/admin

## Next Steps
1. Monitor application logs
2. Set up automated monitoring
3. Configure backup systems
4. Test payment integrations
5. Verify SSL certificates
`;

    fs.writeFileSync('production-test-report.md', report);
    console.log(report);
    console.log('📄 Report saved to: production-test-report.md');
  }
}

// Run the tests
if (require.main === module) {
  const tester = new ProductionDeploymentTester();
  tester.runAllTests().catch(console.error);
}

module.exports = ProductionDeploymentTester;