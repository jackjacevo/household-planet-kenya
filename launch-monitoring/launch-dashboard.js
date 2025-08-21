// Launch Monitoring Dashboard - Real-time metrics tracking
const express = require('express');
const app = express();

// Success Metrics Tracking
class LaunchMetrics {
  constructor() {
    this.metrics = {
      conversionRate: 0,
      pageLoadSpeed: 0,
      customerSatisfaction: 0,
      orderAccuracy: 0,
      systemUptime: 0,
      revenue: 0,
      acquisitionCost: 0
    };
    this.alerts = [];
  }

  // Track conversion rate (target >2.5%)
  updateConversionRate(visitors, conversions) {
    this.metrics.conversionRate = (conversions / visitors) * 100;
    if (this.metrics.conversionRate < 2.5) {
      this.addAlert('CRITICAL', 'Conversion rate below target: ' + this.metrics.conversionRate.toFixed(2) + '%');
    }
  }

  // Track page load speed (target <3 seconds)
  updatePageLoadSpeed(loadTime) {
    this.metrics.pageLoadSpeed = loadTime;
    if (loadTime > 3000) {
      this.addAlert('WARNING', 'Page load speed above target: ' + (loadTime/1000).toFixed(2) + 's');
    }
  }

  // Track customer satisfaction (target 4.5/5)
  updateCustomerSatisfaction(rating) {
    this.metrics.customerSatisfaction = rating;
    if (rating < 4.5) {
      this.addAlert('WARNING', 'Customer satisfaction below target: ' + rating.toFixed(1) + '/5');
    }
  }

  // Track order accuracy (target 99%+)
  updateOrderAccuracy(total, accurate) {
    this.metrics.orderAccuracy = (accurate / total) * 100;
    if (this.metrics.orderAccuracy < 99) {
      this.addAlert('CRITICAL', 'Order accuracy below target: ' + this.metrics.orderAccuracy.toFixed(2) + '%');
    }
  }

  // Track system uptime (target 99.9%+)
  updateSystemUptime(uptime) {
    this.metrics.systemUptime = uptime;
    if (uptime < 99.9) {
      this.addAlert('CRITICAL', 'System uptime below target: ' + uptime.toFixed(2) + '%');
    }
  }

  addAlert(level, message) {
    this.alerts.push({
      level,
      message,
      timestamp: new Date().toISOString()
    });
    console.log(`[${level}] ${message}`);
  }

  getStatus() {
    return {
      metrics: this.metrics,
      alerts: this.alerts.slice(-10), // Last 10 alerts
      overallHealth: this.calculateHealth()
    };
  }

  calculateHealth() {
    const checks = [
      this.metrics.conversionRate >= 2.5,
      this.metrics.pageLoadSpeed <= 3000,
      this.metrics.customerSatisfaction >= 4.5,
      this.metrics.orderAccuracy >= 99,
      this.metrics.systemUptime >= 99.9
    ];
    return (checks.filter(Boolean).length / checks.length) * 100;
  }
}

const launchMetrics = new LaunchMetrics();

// API endpoints
app.get('/launch/status', (req, res) => {
  res.json(launchMetrics.getStatus());
});

app.post('/launch/metrics/conversion', (req, res) => {
  const { visitors, conversions } = req.body;
  launchMetrics.updateConversionRate(visitors, conversions);
  res.json({ success: true });
});

app.post('/launch/metrics/performance', (req, res) => {
  const { loadTime } = req.body;
  launchMetrics.updatePageLoadSpeed(loadTime);
  res.json({ success: true });
});

app.listen(3002, () => {
  console.log('Launch monitoring dashboard running on port 3002');
});

module.exports = { LaunchMetrics, launchMetrics };