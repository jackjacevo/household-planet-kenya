// Real-time Alert System for Launch Monitoring
const EventEmitter = require('events');

class RealTimeAlerts extends EventEmitter {
  constructor() {
    super();
    this.thresholds = {
      conversionRate: 2.5,
      pageLoadSpeed: 3000,
      customerSatisfaction: 4.5,
      orderAccuracy: 99,
      systemUptime: 99.9,
      errorRate: 1,
      responseTime: 2000
    };
    this.alertHistory = [];
    this.isMonitoring = false;
  }

  startMonitoring() {
    this.isMonitoring = true;
    console.log('🔍 Real-time monitoring started');
    
    // Simulate real-time monitoring
    this.monitoringInterval = setInterval(() => {
      this.checkSystemMetrics();
    }, 30000); // Check every 30 seconds
  }

  stopMonitoring() {
    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    console.log('⏹️  Real-time monitoring stopped');
  }

  checkSystemMetrics() {
    // Simulate metric collection
    const metrics = {
      conversionRate: Math.random() * 5,
      pageLoadSpeed: Math.random() * 5000,
      customerSatisfaction: 3 + Math.random() * 2,
      orderAccuracy: 95 + Math.random() * 5,
      systemUptime: 99 + Math.random(),
      errorRate: Math.random() * 3,
      responseTime: Math.random() * 3000
    };

    this.evaluateMetrics(metrics);
  }

  evaluateMetrics(metrics) {
    Object.entries(metrics).forEach(([metric, value]) => {
      const threshold = this.thresholds[metric];
      let alertLevel = null;
      let message = '';

      switch (metric) {
        case 'conversionRate':
          if (value < threshold) {
            alertLevel = value < threshold * 0.5 ? 'CRITICAL' : 'WARNING';
            message = `Conversion rate dropped to ${value.toFixed(2)}% (target: >${threshold}%)`;
          }
          break;
        case 'pageLoadSpeed':
          if (value > threshold) {
            alertLevel = value > threshold * 2 ? 'CRITICAL' : 'WARNING';
            message = `Page load speed increased to ${(value/1000).toFixed(2)}s (target: <${threshold/1000}s)`;
          }
          break;
        case 'customerSatisfaction':
          if (value < threshold) {
            alertLevel = value < threshold * 0.8 ? 'CRITICAL' : 'WARNING';
            message = `Customer satisfaction dropped to ${value.toFixed(1)}/5 (target: >${threshold}/5)`;
          }
          break;
        case 'orderAccuracy':
          if (value < threshold) {
            alertLevel = value < threshold * 0.95 ? 'CRITICAL' : 'WARNING';
            message = `Order accuracy dropped to ${value.toFixed(2)}% (target: >${threshold}%)`;
          }
          break;
        case 'systemUptime':
          if (value < threshold) {
            alertLevel = value < threshold * 0.99 ? 'CRITICAL' : 'WARNING';
            message = `System uptime dropped to ${value.toFixed(2)}% (target: >${threshold}%)`;
          }
          break;
        case 'errorRate':
          if (value > threshold) {
            alertLevel = value > threshold * 3 ? 'CRITICAL' : 'WARNING';
            message = `Error rate increased to ${value.toFixed(2)}% (target: <${threshold}%)`;
          }
          break;
        case 'responseTime':
          if (value > threshold) {
            alertLevel = value > threshold * 2 ? 'CRITICAL' : 'WARNING';
            message = `Response time increased to ${(value/1000).toFixed(2)}s (target: <${threshold/1000}s)`;
          }
          break;
      }

      if (alertLevel) {
        this.triggerAlert(alertLevel, message, metric, value);
      }
    });
  }

  triggerAlert(level, message, metric, value) {
    const alert = {
      id: Date.now(),
      level,
      message,
      metric,
      value,
      timestamp: new Date().toISOString(),
      acknowledged: false
    };

    this.alertHistory.push(alert);
    this.emit('alert', alert);

    // Console output with color coding
    const color = level === 'CRITICAL' ? '\x1b[31m' : '\x1b[33m'; // Red for critical, yellow for warning
    console.log(`${color}[${level}] ${message}\x1b[0m`);

    // Auto-escalate critical alerts
    if (level === 'CRITICAL') {
      this.escalateAlert(alert);
    }
  }

  escalateAlert(alert) {
    console.log(`🚨 ESCALATING CRITICAL ALERT: ${alert.message}`);
    
    // Simulate notification to support team
    this.emit('escalation', {
      ...alert,
      escalatedAt: new Date().toISOString(),
      notificationsSent: ['email', 'sms', 'slack']
    });
  }

  acknowledgeAlert(alertId) {
    const alert = this.alertHistory.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedAt = new Date().toISOString();
      console.log(`✅ Alert ${alertId} acknowledged`);
    }
  }

  getActiveAlerts() {
    return this.alertHistory
      .filter(alert => !alert.acknowledged)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  getAlertSummary() {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentAlerts = this.alertHistory.filter(
      alert => new Date(alert.timestamp) > last24h
    );

    return {
      total: this.alertHistory.length,
      active: this.getActiveAlerts().length,
      last24h: recentAlerts.length,
      critical: recentAlerts.filter(a => a.level === 'CRITICAL').length,
      warning: recentAlerts.filter(a => a.level === 'WARNING').length,
      byMetric: this.groupAlertsByMetric(recentAlerts)
    };
  }

  groupAlertsByMetric(alerts) {
    return alerts.reduce((acc, alert) => {
      acc[alert.metric] = (acc[alert.metric] || 0) + 1;
      return acc;
    }, {});
  }
}

// Contingency Plan Automation
class ContingencyPlan {
  constructor() {
    this.plans = {
      'high-traffic': {
        trigger: 'Traffic spike detected',
        actions: ['Scale servers', 'Enable CDN', 'Activate load balancer']
      },
      'payment-failure': {
        trigger: 'Payment processing issues',
        actions: ['Switch to backup gateway', 'Notify customers', 'Log incidents']
      },
      'system-downtime': {
        trigger: 'System unavailable',
        actions: ['Activate maintenance page', 'Switch to backup', 'Alert team']
      },
      'security-breach': {
        trigger: 'Security threat detected',
        actions: ['Block suspicious IPs', 'Enable security mode', 'Notify security team']
      }
    };
  }

  activatePlan(planType, severity = 'medium') {
    const plan = this.plans[planType];
    if (!plan) {
      console.log(`❌ No contingency plan found for: ${planType}`);
      return false;
    }

    console.log(`🚨 ACTIVATING CONTINGENCY PLAN: ${planType.toUpperCase()}`);
    console.log(`Trigger: ${plan.trigger}`);
    console.log(`Severity: ${severity.toUpperCase()}`);
    
    plan.actions.forEach((action, index) => {
      setTimeout(() => {
        console.log(`⚡ Executing: ${action}`);
      }, index * 1000);
    });

    return true;
  }
}

module.exports = { RealTimeAlerts, ContingencyPlan };