// Performance Metrics Tracking System
const axios = require('axios');

class PerformanceTracker {
  constructor() {
    this.metrics = {
      responseTime: [],
      throughput: 0,
      errorRate: 0,
      cpuUsage: 0,
      memoryUsage: 0,
      diskUsage: 0,
      databasePerformance: {},
      coreWebVitals: {}
    };
    
    this.thresholds = {
      responseTime: 2000, // 2 seconds
      errorRate: 5, // 5%
      cpuUsage: 80, // 80%
      memoryUsage: 85, // 85%
      diskUsage: 90, // 90%
      databaseQueryTime: 1000 // 1 second
    };
    
    this.performanceHistory = [];
  }

  async collectSystemMetrics() {
    try {
      const response = await axios.get('https://api.householdplanet.co.ke/api/admin/metrics/system');
      const metrics = response.data;
      
      this.metrics.cpuUsage = metrics.cpu.usage;
      this.metrics.memoryUsage = metrics.memory.usage;
      this.metrics.diskUsage = metrics.disk.usage;
      
      return metrics;
    } catch (error) {
      console.error('Failed to collect system metrics:', error);
      return null;
    }
  }

  async collectApplicationMetrics() {
    try {
      const response = await axios.get('https://api.householdplanet.co.ke/api/admin/metrics/application');
      const metrics = response.data;
      
      this.metrics.responseTime = metrics.responseTime || [];
      this.metrics.throughput = metrics.throughput || 0;
      this.metrics.errorRate = metrics.errorRate || 0;
      
      return metrics;
    } catch (error) {
      console.error('Failed to collect application metrics:', error);
      return null;
    }
  }

  async collectDatabaseMetrics() {
    try {
      const response = await axios.get('https://api.householdplanet.co.ke/api/admin/metrics/database');
      const metrics = response.data;
      
      this.metrics.databasePerformance = {
        queryTime: metrics.averageQueryTime,
        connections: metrics.activeConnections,
        slowQueries: metrics.slowQueries,
        lockWaits: metrics.lockWaits
      };
      
      return metrics;
    } catch (error) {
      console.error('Failed to collect database metrics:', error);
      return null;
    }
  }

  async collectWebVitals() {
    try {
      const response = await axios.get('https://api.householdplanet.co.ke/api/admin/metrics/web-vitals');
      const vitals = response.data;
      
      this.metrics.coreWebVitals = {
        fcp: vitals.firstContentfulPaint,
        lcp: vitals.largestContentfulPaint,
        fid: vitals.firstInputDelay,
        cls: vitals.cumulativeLayoutShift,
        ttfb: vitals.timeToFirstByte
      };
      
      return vitals;
    } catch (error) {
      console.error('Failed to collect web vitals:', error);
      return null;
    }
  }

  async measureEndpointPerformance() {
    const endpoints = [
      { url: 'https://householdplanet.co.ke', name: 'Homepage' },
      { url: 'https://householdplanet.co.ke/products', name: 'Products Page' },
      { url: 'https://api.householdplanet.co.ke/api/products', name: 'Products API' },
      { url: 'https://api.householdplanet.co.ke/api/categories', name: 'Categories API' }
    ];
    
    const endpointMetrics = [];
    
    for (const endpoint of endpoints) {
      const startTime = Date.now();
      try {
        const response = await axios.get(endpoint.url, { timeout: 10000 });
        const responseTime = Date.now() - startTime;
        
        endpointMetrics.push({
          name: endpoint.name,
          url: endpoint.url,
          responseTime,
          status: response.status,
          success: true
        });
        
      } catch (error) {
        const responseTime = Date.now() - startTime;
        endpointMetrics.push({
          name: endpoint.name,
          url: endpoint.url,
          responseTime,
          status: error.response?.status || 0,
          success: false,
          error: error.message
        });
      }
    }
    
    return endpointMetrics;
  }

  analyzePerformance(systemMetrics, appMetrics, dbMetrics, webVitals, endpointMetrics) {
    const issues = [];
    const recommendations = [];
    
    // System performance analysis
    if (systemMetrics) {
      if (systemMetrics.cpu.usage > this.thresholds.cpuUsage) {
        issues.push({
          type: 'HIGH_CPU_USAGE',
          severity: 'WARNING',
          value: systemMetrics.cpu.usage,
          threshold: this.thresholds.cpuUsage
        });
        recommendations.push('Consider scaling up CPU resources or optimizing CPU-intensive operations');
      }
      
      if (systemMetrics.memory.usage > this.thresholds.memoryUsage) {
        issues.push({
          type: 'HIGH_MEMORY_USAGE',
          severity: 'WARNING',
          value: systemMetrics.memory.usage,
          threshold: this.thresholds.memoryUsage
        });
        recommendations.push('Investigate memory leaks or consider increasing memory allocation');
      }
      
      if (systemMetrics.disk.usage > this.thresholds.diskUsage) {
        issues.push({
          type: 'HIGH_DISK_USAGE',
          severity: 'CRITICAL',
          value: systemMetrics.disk.usage,
          threshold: this.thresholds.diskUsage
        });
        recommendations.push('Clean up disk space immediately or add more storage');
      }
    }
    
    // Application performance analysis
    if (appMetrics) {
      const avgResponseTime = appMetrics.responseTime.reduce((sum, time) => sum + time, 0) / appMetrics.responseTime.length;
      
      if (avgResponseTime > this.thresholds.responseTime) {
        issues.push({
          type: 'SLOW_RESPONSE_TIME',
          severity: 'WARNING',
          value: avgResponseTime,
          threshold: this.thresholds.responseTime
        });
        recommendations.push('Optimize application code or database queries');
      }
      
      if (appMetrics.errorRate > this.thresholds.errorRate) {
        issues.push({
          type: 'HIGH_ERROR_RATE',
          severity: 'CRITICAL',
          value: appMetrics.errorRate,
          threshold: this.thresholds.errorRate
        });
        recommendations.push('Investigate and fix application errors immediately');
      }
    }
    
    // Database performance analysis
    if (dbMetrics && dbMetrics.averageQueryTime > this.thresholds.databaseQueryTime) {
      issues.push({
        type: 'SLOW_DATABASE_QUERIES',
        severity: 'WARNING',
        value: dbMetrics.averageQueryTime,
        threshold: this.thresholds.databaseQueryTime
      });
      recommendations.push('Optimize database queries and consider adding indexes');
    }
    
    // Web Vitals analysis
    if (webVitals) {
      if (webVitals.largestContentfulPaint > 2500) {
        issues.push({
          type: 'POOR_LCP',
          severity: 'WARNING',
          value: webVitals.largestContentfulPaint,
          threshold: 2500
        });
        recommendations.push('Optimize images and reduce server response times');
      }
      
      if (webVitals.firstInputDelay > 100) {
        issues.push({
          type: 'POOR_FID',
          severity: 'WARNING',
          value: webVitals.firstInputDelay,
          threshold: 100
        });
        recommendations.push('Reduce JavaScript execution time');
      }
      
      if (webVitals.cumulativeLayoutShift > 0.1) {
        issues.push({
          type: 'POOR_CLS',
          severity: 'WARNING',
          value: webVitals.cumulativeLayoutShift,
          threshold: 0.1
        });
        recommendations.push('Fix layout shifts by setting image dimensions');
      }
    }
    
    return { issues, recommendations };
  }

  async sendPerformanceAlert(issues) {
    if (issues.length === 0) return;
    
    const criticalIssues = issues.filter(issue => issue.severity === 'CRITICAL');
    const warningIssues = issues.filter(issue => issue.severity === 'WARNING');
    
    try {
      await axios.post(process.env.SLACK_WEBHOOK_URL, {
        text: `📊 Performance Alert: ${issues.length} issues detected`,
        channel: '#performance-alerts',
        attachments: [{
          color: criticalIssues.length > 0 ? 'danger' : 'warning',
          fields: [
            { title: 'Critical Issues', value: criticalIssues.length.toString(), short: true },
            { title: 'Warning Issues', value: warningIssues.length.toString(), short: true },
            { title: 'Top Issues', value: issues.slice(0, 3).map(i => `${i.type}: ${i.value}`).join('\n'), short: false }
          ]
        }]
      });
    } catch (error) {
      console.error('Failed to send performance alert:', error);
    }
  }

  async generatePerformanceReport(systemMetrics, appMetrics, dbMetrics, webVitals, endpointMetrics, analysis) {
    const report = {
      timestamp: new Date().toISOString(),
      systemMetrics,
      applicationMetrics: appMetrics,
      databaseMetrics: dbMetrics,
      webVitals,
      endpointMetrics,
      analysis,
      summary: {
        overallHealth: analysis.issues.length === 0 ? 'GOOD' : 
                      analysis.issues.some(i => i.severity === 'CRITICAL') ? 'CRITICAL' : 'WARNING',
        totalIssues: analysis.issues.length,
        criticalIssues: analysis.issues.filter(i => i.severity === 'CRITICAL').length
      }
    };
    
    // Store performance history
    this.performanceHistory.push(report);
    
    // Keep only last 24 hours of data
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    this.performanceHistory = this.performanceHistory.filter(
      record => new Date(record.timestamp).getTime() > oneDayAgo
    );
    
    try {
      await axios.post('https://api.householdplanet.co.ke/api/admin/reports/performance', report);
      console.log('✅ Performance report saved');
    } catch (error) {
      console.error('Failed to save performance report:', error);
    }
    
    return report;
  }

  async runPerformanceCheck() {
    console.log('📊 Running performance check...');
    
    const systemMetrics = await this.collectSystemMetrics();
    const appMetrics = await this.collectApplicationMetrics();
    const dbMetrics = await this.collectDatabaseMetrics();
    const webVitals = await this.collectWebVitals();
    const endpointMetrics = await this.measureEndpointPerformance();
    
    const analysis = this.analyzePerformance(systemMetrics, appMetrics, dbMetrics, webVitals, endpointMetrics);
    
    if (analysis.issues.length > 0) {
      console.log(`⚠️ Found ${analysis.issues.length} performance issues`);
      await this.sendPerformanceAlert(analysis.issues);
    } else {
      console.log('✅ All performance metrics within acceptable ranges');
    }
    
    const report = await this.generatePerformanceReport(
      systemMetrics, appMetrics, dbMetrics, webVitals, endpointMetrics, analysis
    );
    
    this.logPerformanceSummary(report);
  }

  logPerformanceSummary(report) {
    console.log('📈 Performance Summary:');
    if (report.systemMetrics) {
      console.log(`   CPU Usage: ${report.systemMetrics.cpu.usage}%`);
      console.log(`   Memory Usage: ${report.systemMetrics.memory.usage}%`);
      console.log(`   Disk Usage: ${report.systemMetrics.disk.usage}%`);
    }
    
    if (report.webVitals) {
      console.log(`   LCP: ${report.webVitals.largestContentfulPaint}ms`);
      console.log(`   FID: ${report.webVitals.firstInputDelay}ms`);
      console.log(`   CLS: ${report.webVitals.cumulativeLayoutShift}`);
    }
    
    console.log(`   Overall Health: ${report.summary.overallHealth}`);
  }

  startPerformanceTracking() {
    console.log('🚀 Starting performance metrics tracking...');
    
    // Run performance check every 5 minutes
    setInterval(() => {
      this.runPerformanceCheck();
    }, 300000);
    
    // Generate hourly trend analysis
    setInterval(() => {
      this.generateTrendAnalysis();
    }, 3600000);
  }

  generateTrendAnalysis() {
    if (this.performanceHistory.length < 2) return;
    
    const recent = this.performanceHistory.slice(-12); // Last hour (5-minute intervals)
    const trends = this.analyzeTrends(recent);
    
    console.log('📈 Performance Trends (Last Hour):');
    Object.entries(trends).forEach(([metric, trend]) => {
      console.log(`   ${metric}: ${trend > 0 ? '↗️' : trend < 0 ? '↘️' : '➡️'} ${Math.abs(trend).toFixed(2)}%`);
    });
  }

  analyzeTrends(history) {
    // Simple trend analysis - compare first half vs second half
    const midpoint = Math.floor(history.length / 2);
    const firstHalf = history.slice(0, midpoint);
    const secondHalf = history.slice(midpoint);
    
    const avgFirst = (data, path) => {
      const values = data.map(d => this.getNestedValue(d, path)).filter(v => v !== null);
      return values.reduce((sum, val) => sum + val, 0) / values.length;
    };
    
    const trends = {};
    
    if (firstHalf.length > 0 && secondHalf.length > 0) {
      const cpuFirst = avgFirst(firstHalf, 'systemMetrics.cpu.usage');
      const cpuSecond = avgFirst(secondHalf, 'systemMetrics.cpu.usage');
      trends.cpu = ((cpuSecond - cpuFirst) / cpuFirst) * 100;
      
      const memFirst = avgFirst(firstHalf, 'systemMetrics.memory.usage');
      const memSecond = avgFirst(secondHalf, 'systemMetrics.memory.usage');
      trends.memory = ((memSecond - memFirst) / memFirst) * 100;
    }
    
    return trends;
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current && current[key], obj);
  }
}

// Start performance tracking
const performanceTracker = new PerformanceTracker();
performanceTracker.startPerformanceTracking();

module.exports = PerformanceTracker;