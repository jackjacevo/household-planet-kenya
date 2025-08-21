// Centralized Monitoring Dashboard
const RealTimeMonitor = require('./real-time-monitoring');
const ErrorTracker = require('./error-tracking');
const FeedbackCollector = require('./customer-feedback-system');
const SalesTracker = require('./sales-conversion-tracking');
const SecurityMonitor = require('./security-threat-monitoring');
const BackupVerifier = require('./backup-verification');
const PerformanceTracker = require('./performance-metrics');

class MonitoringDashboard {
  constructor() {
    this.monitors = {
      realTime: new RealTimeMonitor(),
      errors: new ErrorTracker(),
      feedback: new FeedbackCollector(),
      sales: new SalesTracker(),
      security: new SecurityMonitor(),
      backups: new BackupVerifier(),
      performance: new PerformanceTracker()
    };
    
    this.dashboardData = {
      systemHealth: 'UNKNOWN',
      alerts: [],
      metrics: {},
      lastUpdate: null
    };
  }

  async initializeMonitoring() {
    console.log('🚀 Initializing Household Planet Kenya Monitoring Dashboard...');
    
    try {
      // Start all monitoring systems
      this.monitors.realTime.startMonitoring();
      this.monitors.errors.startErrorTracking();
      this.monitors.feedback.startFeedbackCollection();
      this.monitors.sales.startSalesTracking();
      this.monitors.security.startSecurityMonitoring();
      this.monitors.backups.startBackupVerification();
      this.monitors.performance.startPerformanceTracking();
      
      console.log('✅ All monitoring systems started successfully');
      
      // Start dashboard updates
      this.startDashboardUpdates();
      
      // Generate startup report
      await this.generateStartupReport();
      
    } catch (error) {
      console.error('❌ Failed to initialize monitoring:', error);
      await this.sendCriticalAlert('MONITORING_INITIALIZATION_FAILED', error.message);
    }
  }

  startDashboardUpdates() {
    // Update dashboard every minute
    setInterval(async () => {
      await this.updateDashboard();
    }, 60000);
    
    // Generate comprehensive report every 6 hours
    setInterval(async () => {
      await this.generateComprehensiveReport();
    }, 21600000);
  }

  async updateDashboard() {
    try {
      const healthStatus = await this.assessSystemHealth();
      const activeAlerts = await this.getActiveAlerts();
      const keyMetrics = await this.getKeyMetrics();
      
      this.dashboardData = {
        systemHealth: healthStatus,
        alerts: activeAlerts,
        metrics: keyMetrics,
        lastUpdate: new Date().toISOString()
      };
      
      // Send to monitoring dashboard API
      await this.updateDashboardAPI(this.dashboardData);
      
    } catch (error) {
      console.error('Failed to update dashboard:', error);
    }
  }

  async assessSystemHealth() {
    const healthChecks = [
      { name: 'API', check: () => this.checkAPIHealth() },
      { name: 'Database', check: () => this.checkDatabaseHealth() },
      { name: 'Payment System', check: () => this.checkPaymentHealth() },
      { name: 'File Storage', check: () => this.checkStorageHealth() },
      { name: 'Email Service', check: () => this.checkEmailHealth() }
    ];
    
    const results = await Promise.allSettled(
      healthChecks.map(async ({ name, check }) => ({
        name,
        status: await check()
      }))
    );
    
    const healthyServices = results.filter(r => 
      r.status === 'fulfilled' && r.value.status === 'healthy'
    ).length;
    
    const totalServices = healthChecks.length;
    const healthPercentage = (healthyServices / totalServices) * 100;
    
    if (healthPercentage >= 90) return 'HEALTHY';
    if (healthPercentage >= 70) return 'DEGRADED';
    return 'CRITICAL';
  }

  async checkAPIHealth() {
    try {
      const response = await axios.get('https://api.householdplanet.co.ke/health', { timeout: 5000 });
      return { status: response.status === 200 ? 'healthy' : 'unhealthy' };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  async checkDatabaseHealth() {
    try {
      const response = await axios.get('https://api.householdplanet.co.ke/api/admin/db-health', { timeout: 5000 });
      return { status: response.data.healthy ? 'healthy' : 'unhealthy' };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  async checkPaymentHealth() {
    try {
      const response = await axios.get('https://api.householdplanet.co.ke/api/payments/health', { timeout: 5000 });
      return { status: response.data.healthy ? 'healthy' : 'unhealthy' };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  async checkStorageHealth() {
    try {
      const response = await axios.get('https://api.householdplanet.co.ke/api/admin/storage-health', { timeout: 5000 });
      return { status: response.data.healthy ? 'healthy' : 'unhealthy' };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  async checkEmailHealth() {
    try {
      const response = await axios.get('https://api.householdplanet.co.ke/api/admin/email-health', { timeout: 5000 });
      return { status: response.data.healthy ? 'healthy' : 'unhealthy' };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  async getActiveAlerts() {
    try {
      const response = await axios.get('https://api.householdplanet.co.ke/api/admin/alerts/active');
      return response.data.alerts || [];
    } catch (error) {
      console.error('Failed to get active alerts:', error);
      return [];
    }
  }

  async getKeyMetrics() {
    try {
      const response = await axios.get('https://api.householdplanet.co.ke/api/admin/metrics/summary');
      return response.data.metrics || {};
    } catch (error) {
      console.error('Failed to get key metrics:', error);
      return {};
    }
  }

  async updateDashboardAPI(data) {
    try {
      await axios.post('https://api.householdplanet.co.ke/api/admin/dashboard/update', data);
    } catch (error) {
      console.error('Failed to update dashboard API:', error);
    }
  }

  async generateStartupReport() {
    const report = {
      timestamp: new Date().toISOString(),
      event: 'MONITORING_SYSTEM_STARTUP',
      systemHealth: await this.assessSystemHealth(),
      activeMonitors: Object.keys(this.monitors),
      initialMetrics: await this.getKeyMetrics()
    };
    
    console.log('📊 Startup Report Generated:');
    console.log(`   System Health: ${report.systemHealth}`);
    console.log(`   Active Monitors: ${report.activeMonitors.length}`);
    
    await this.sendStartupNotification(report);
  }

  async generateComprehensiveReport() {
    console.log('📋 Generating comprehensive monitoring report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      period: '6_HOURS',
      systemHealth: this.dashboardData.systemHealth,
      alerts: {
        total: this.dashboardData.alerts.length,
        critical: this.dashboardData.alerts.filter(a => a.severity === 'CRITICAL').length,
        warning: this.dashboardData.alerts.filter(a => a.severity === 'WARNING').length
      },
      metrics: this.dashboardData.metrics,
      recommendations: await this.generateRecommendations()
    };
    
    try {
      await axios.post('https://api.householdplanet.co.ke/api/admin/reports/comprehensive', report);
      
      // Send to management
      await this.sendComprehensiveReport(report);
      
      console.log('✅ Comprehensive report generated and sent');
    } catch (error) {
      console.error('Failed to generate comprehensive report:', error);
    }
  }

  async generateRecommendations() {
    const recommendations = [];
    
    // System health recommendations
    if (this.dashboardData.systemHealth === 'CRITICAL') {
      recommendations.push('URGENT: System health is critical - immediate investigation required');
    } else if (this.dashboardData.systemHealth === 'DEGRADED') {
      recommendations.push('System performance is degraded - review and optimize services');
    }
    
    // Alert-based recommendations
    const criticalAlerts = this.dashboardData.alerts.filter(a => a.severity === 'CRITICAL');
    if (criticalAlerts.length > 0) {
      recommendations.push(`${criticalAlerts.length} critical alerts require immediate attention`);
    }
    
    // Metrics-based recommendations
    if (this.dashboardData.metrics.errorRate > 5) {
      recommendations.push('High error rate detected - investigate application issues');
    }
    
    if (this.dashboardData.metrics.responseTime > 2000) {
      recommendations.push('Slow response times - optimize application performance');
    }
    
    return recommendations.length > 0 ? recommendations : ['System operating normally - continue monitoring'];
  }

  async sendStartupNotification(report) {
    try {
      await axios.post(process.env.SLACK_WEBHOOK_URL, {
        text: '🚀 Household Planet Kenya Monitoring System Started',
        channel: '#monitoring',
        attachments: [{
          color: 'good',
          fields: [
            { title: 'System Health', value: report.systemHealth, short: true },
            { title: 'Active Monitors', value: report.activeMonitors.length.toString(), short: true },
            { title: 'Startup Time', value: report.timestamp, short: false }
          ]
        }]
      });
    } catch (error) {
      console.error('Failed to send startup notification:', error);
    }
  }

  async sendComprehensiveReport(report) {
    try {
      await axios.post('https://api.householdplanet.co.ke/api/notifications/email', {
        to: 'management@householdplanet.co.ke',
        subject: `Household Planet Kenya - 6-Hour Monitoring Report`,
        body: `
6-Hour Monitoring Report
========================

System Health: ${report.systemHealth}
Report Time: ${report.timestamp}

Alerts Summary:
- Total Alerts: ${report.alerts.total}
- Critical: ${report.alerts.critical}
- Warning: ${report.alerts.warning}

Key Metrics:
- Response Time: ${report.metrics.responseTime || 'N/A'}ms
- Error Rate: ${report.metrics.errorRate || 'N/A'}%
- Active Users: ${report.metrics.activeUsers || 'N/A'}
- Orders (6h): ${report.metrics.orders || 'N/A'}

Recommendations:
${report.recommendations.map(r => `- ${r}`).join('\n')}

Dashboard: https://householdplanet.co.ke/admin/monitoring
        `
      });
    } catch (error) {
      console.error('Failed to send comprehensive report:', error);
    }
  }

  async sendCriticalAlert(type, message) {
    try {
      await axios.post(process.env.SLACK_WEBHOOK_URL, {
        text: `🚨 CRITICAL ALERT: ${type}`,
        channel: '#critical-alerts',
        attachments: [{
          color: 'danger',
          fields: [
            { title: 'Alert Type', value: type, short: true },
            { title: 'Message', value: message, short: false },
            { title: 'Time', value: new Date().toISOString(), short: true }
          ]
        }]
      });
      
      // Send email for critical alerts
      await axios.post('https://api.householdplanet.co.ke/api/notifications/email', {
        to: 'admin@householdplanet.co.ke',
        subject: `CRITICAL ALERT: ${type}`,
        body: `Critical alert detected:\n\nType: ${type}\nMessage: ${message}\nTime: ${new Date().toISOString()}\n\nImmediate action required.`
      });
      
    } catch (error) {
      console.error('Failed to send critical alert:', error);
    }
  }

  getSystemStatus() {
    return {
      status: this.dashboardData.systemHealth,
      lastUpdate: this.dashboardData.lastUpdate,
      activeAlerts: this.dashboardData.alerts.length,
      uptime: process.uptime()
    };
  }
}

// Initialize and start monitoring dashboard
const monitoringDashboard = new MonitoringDashboard();
monitoringDashboard.initializeMonitoring();

module.exports = MonitoringDashboard;