// Real-time Performance Monitoring System
const WebSocket = require('ws');
const axios = require('axios');

class RealTimeMonitor {
  constructor() {
    this.metrics = {
      responseTime: [],
      errorRate: 0,
      activeUsers: 0,
      orderRate: 0,
      paymentSuccess: 0
    };
    this.alerts = [];
    this.thresholds = {
      responseTime: 2000, // 2 seconds
      errorRate: 5, // 5%
      paymentFailure: 10 // 10%
    };
  }

  async checkSystemHealth() {
    const endpoints = [
      { url: 'https://householdplanet.co.ke', name: 'Frontend' },
      { url: 'https://api.householdplanet.co.ke/health', name: 'API' },
      { url: 'https://api.householdplanet.co.ke/api/products', name: 'Products API' }
    ];

    for (const endpoint of endpoints) {
      const startTime = Date.now();
      try {
        const response = await axios.get(endpoint.url, { timeout: 10000 });
        const responseTime = Date.now() - startTime;
        
        this.metrics.responseTime.push({
          endpoint: endpoint.name,
          time: responseTime,
          timestamp: new Date()
        });

        if (responseTime > this.thresholds.responseTime) {
          this.createAlert('HIGH_RESPONSE_TIME', `${endpoint.name} response time: ${responseTime}ms`);
        }

        console.log(`✅ ${endpoint.name}: ${responseTime}ms`);
      } catch (error) {
        this.createAlert('ENDPOINT_DOWN', `${endpoint.name} is unreachable: ${error.message}`);
        console.log(`❌ ${endpoint.name}: DOWN`);
      }
    }
  }

  async checkDatabasePerformance() {
    try {
      const startTime = Date.now();
      await axios.get('https://api.householdplanet.co.ke/api/admin/db-health');
      const queryTime = Date.now() - startTime;
      
      if (queryTime > 1000) {
        this.createAlert('SLOW_DATABASE', `Database query time: ${queryTime}ms`);
      }
      
      console.log(`📊 Database: ${queryTime}ms`);
    } catch (error) {
      this.createAlert('DATABASE_ERROR', `Database health check failed: ${error.message}`);
    }
  }

  async checkPaymentSystem() {
    try {
      const response = await axios.get('https://api.householdplanet.co.ke/api/payments/health');
      const { successRate, failureRate } = response.data;
      
      if (failureRate > this.thresholds.paymentFailure) {
        this.createAlert('HIGH_PAYMENT_FAILURES', `Payment failure rate: ${failureRate}%`);
      }
      
      this.metrics.paymentSuccess = successRate;
      console.log(`💳 Payment Success Rate: ${successRate}%`);
    } catch (error) {
      this.createAlert('PAYMENT_SYSTEM_ERROR', `Payment system check failed: ${error.message}`);
    }
  }

  createAlert(type, message) {
    const alert = {
      type,
      message,
      timestamp: new Date(),
      severity: this.getAlertSeverity(type)
    };
    
    this.alerts.push(alert);
    this.sendAlert(alert);
  }

  getAlertSeverity(type) {
    const criticalAlerts = ['ENDPOINT_DOWN', 'DATABASE_ERROR', 'PAYMENT_SYSTEM_ERROR'];
    const warningAlerts = ['HIGH_RESPONSE_TIME', 'SLOW_DATABASE', 'HIGH_PAYMENT_FAILURES'];
    
    if (criticalAlerts.includes(type)) return 'CRITICAL';
    if (warningAlerts.includes(type)) return 'WARNING';
    return 'INFO';
  }

  async sendAlert(alert) {
    // Send to Slack
    try {
      await axios.post(process.env.SLACK_WEBHOOK_URL, {
        text: `🚨 ${alert.severity}: ${alert.message}`,
        channel: '#alerts',
        username: 'Household Planet Monitor'
      });
    } catch (error) {
      console.error('Failed to send Slack alert:', error.message);
    }

    // Send email for critical alerts
    if (alert.severity === 'CRITICAL') {
      try {
        await axios.post('https://api.householdplanet.co.ke/api/notifications/email', {
          to: 'admin@householdplanet.co.ke',
          subject: `CRITICAL ALERT: ${alert.type}`,
          body: `${alert.message}\n\nTime: ${alert.timestamp}`
        });
      } catch (error) {
        console.error('Failed to send email alert:', error.message);
      }
    }
  }

  startMonitoring() {
    console.log('🔄 Starting real-time monitoring...');
    
    // Check every 30 seconds
    setInterval(() => {
      this.checkSystemHealth();
      this.checkDatabasePerformance();
      this.checkPaymentSystem();
    }, 30000);

    // Generate hourly summary
    setInterval(() => {
      this.generateHourlySummary();
    }, 3600000);
  }

  generateHourlySummary() {
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 3600000);
    
    const recentMetrics = this.metrics.responseTime.filter(m => m.timestamp > hourAgo);
    const avgResponseTime = recentMetrics.reduce((sum, m) => sum + m.time, 0) / recentMetrics.length;
    
    const recentAlerts = this.alerts.filter(a => a.timestamp > hourAgo);
    
    console.log(`📈 Hourly Summary (${hourAgo.toLocaleTimeString()} - ${now.toLocaleTimeString()}):`);
    console.log(`   Average Response Time: ${Math.round(avgResponseTime)}ms`);
    console.log(`   Alerts Generated: ${recentAlerts.length}`);
    console.log(`   Payment Success Rate: ${this.metrics.paymentSuccess}%`);
  }
}

// Start monitoring
const monitor = new RealTimeMonitor();
monitor.startMonitoring();