#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');

const FRONTEND_URL = 'https://householdplanetkenya.co.ke';
const BACKEND_URL = 'https://api.householdplanetkenya.co.ke';

class ProductionMonitor {
  constructor() {
    this.alerts = [];
    this.metrics = {
      uptime: { frontend: 0, backend: 0 },
      responseTime: { frontend: [], backend: [] },
      errors: { frontend: 0, backend: 0 }
    };
  }

  async monitor() {
    console.log('🔍 Starting Production Monitoring...\n');
    
    setInterval(async () => {
      await this.checkServices();
      await this.logMetrics();
    }, 30000); // Check every 30 seconds

    // Initial check
    await this.checkServices();
    await this.generateDashboard();
  }

  async checkServices() {
    const timestamp = new Date().toISOString();
    
    // Check Backend
    try {
      const start = Date.now();
      const response = await axios.get(`${BACKEND_URL}/health`, { timeout: 10000 });
      const responseTime = Date.now() - start;
      
      this.metrics.uptime.backend++;
      this.metrics.responseTime.backend.push(responseTime);
      
      console.log(`✅ Backend: ${response.status} (${responseTime}ms)`);
    } catch (error) {
      this.metrics.errors.backend++;
      this.alerts.push({
        service: 'Backend',
        error: error.message,
        timestamp
      });
      console.log(`❌ Backend: ${error.message}`);
    }

    // Check Frontend
    try {
      const start = Date.now();
      const response = await axios.get(FRONTEND_URL, { timeout: 15000 });
      const responseTime = Date.now() - start;
      
      this.metrics.uptime.frontend++;
      this.metrics.responseTime.frontend.push(responseTime);
      
      console.log(`✅ Frontend: ${response.status} (${responseTime}ms)`);
    } catch (error) {
      this.metrics.errors.frontend++;
      this.alerts.push({
        service: 'Frontend',
        error: error.message,
        timestamp
      });
      console.log(`❌ Frontend: ${error.message}`);
    }

    // Check critical endpoints
    await this.checkCriticalEndpoints();
  }

  async checkCriticalEndpoints() {
    const endpoints = [
      '/api/categories',
      '/api/products',
      '/api/delivery/locations'
    ];

    for (const endpoint of endpoints) {
      try {
        await axios.get(`${BACKEND_URL}${endpoint}`, { timeout: 5000 });
      } catch (error) {
        this.alerts.push({
          service: `API${endpoint}`,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  async logMetrics() {
    const logEntry = {
      timestamp: new Date().toISOString(),
      metrics: {
        backend: {
          uptime: this.metrics.uptime.backend,
          errors: this.metrics.errors.backend,
          avgResponseTime: this.getAverageResponseTime('backend')
        },
        frontend: {
          uptime: this.metrics.uptime.frontend,
          errors: this.metrics.errors.frontend,
          avgResponseTime: this.getAverageResponseTime('frontend')
        }
      },
      alerts: this.alerts.slice(-10) // Last 10 alerts
    };

    fs.appendFileSync('production-monitoring.log', JSON.stringify(logEntry) + '\n');
  }

  getAverageResponseTime(service) {
    const times = this.metrics.responseTime[service];
    if (times.length === 0) return 0;
    return Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  }

  async generateDashboard() {
    const dashboard = `
# Production Monitoring Dashboard
Last Updated: ${new Date().toISOString()}

## Service Status
- 🌐 Frontend: ${FRONTEND_URL}
- 🔌 Backend: ${BACKEND_URL}

## Uptime Metrics
- Frontend Checks: ${this.metrics.uptime.frontend}
- Backend Checks: ${this.metrics.uptime.backend}
- Frontend Errors: ${this.metrics.errors.frontend}
- Backend Errors: ${this.metrics.errors.backend}

## Performance
- Frontend Avg Response: ${this.getAverageResponseTime('frontend')}ms
- Backend Avg Response: ${this.getAverageResponseTime('backend')}ms

## Recent Alerts
${this.alerts.slice(-5).map(alert => 
  `- ${alert.timestamp}: ${alert.service} - ${alert.error}`
).join('\n')}

## Quick Actions
- View logs: tail -f production-monitoring.log
- Restart services: docker-compose restart
- Check SSL: openssl s_client -connect householdplanetkenya.co.ke:443
`;

    fs.writeFileSync('production-dashboard.md', dashboard);
    console.log('\n📊 Dashboard updated: production-dashboard.md');
  }
}

// Start monitoring
if (require.main === module) {
  const monitor = new ProductionMonitor();
  monitor.monitor().catch(console.error);
}

module.exports = ProductionMonitor;