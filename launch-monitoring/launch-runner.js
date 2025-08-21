#!/usr/bin/env node
// Launch Day Execution Script
const { LaunchVerification, LaunchDayTasks } = require('./launch-verification');
const { LaunchMetrics } = require('./launch-dashboard');
const { RealTimeAlerts, ContingencyPlan } = require('./real-time-alerts');

class LaunchRunner {
  constructor() {
    this.verification = new LaunchVerification();
    this.tasks = new LaunchDayTasks();
    this.metrics = new LaunchMetrics();
    this.alerts = new RealTimeAlerts();
    this.contingency = new ContingencyPlan();
    
    this.setupAlertHandlers();
  }

  setupAlertHandlers() {
    this.alerts.on('alert', (alert) => {
      console.log(`📢 Alert received: ${alert.message}`);
    });

    this.alerts.on('escalation', (alert) => {
      console.log(`🚨 Critical alert escalated: ${alert.message}`);
      // Auto-activate contingency plans for critical issues
      this.handleCriticalAlert(alert);
    });
  }

  handleCriticalAlert(alert) {
    switch (alert.metric) {
      case 'systemUptime':
        this.contingency.activatePlan('system-downtime', 'high');
        break;
      case 'errorRate':
        this.contingency.activatePlan('high-traffic', 'medium');
        break;
      case 'conversionRate':
        console.log('🔍 Investigating conversion rate drop...');
        break;
    }
  }

  async runPreLaunchVerification() {
    console.log('🔍 Running Pre-Launch Verification...\n');
    const results = await this.verification.runAllChecks();
    
    if (results.failed > 0) {
      console.log('\n❌ Pre-launch verification failed. Cannot proceed with launch.');
      process.exit(1);
    }
    
    console.log('\n✅ Pre-launch verification passed!');
    return results;
  }

  async executeLaunchDay() {
    console.log('🚀 Starting Launch Day Execution...\n');
    
    // Start monitoring
    this.alerts.startMonitoring();
    
    // Execute launch tasks
    await this.tasks.executeAllTasks();
    
    // Start metrics tracking
    console.log('\n📊 Starting metrics tracking...');
    
    // Simulate initial metrics
    this.metrics.updateConversionRate(1000, 30); // 3% conversion rate
    this.metrics.updatePageLoadSpeed(2500); // 2.5s load time
    this.metrics.updateCustomerSatisfaction(4.6); // 4.6/5 rating
    this.metrics.updateOrderAccuracy(100, 99); // 99% accuracy
    this.metrics.updateSystemUptime(99.95); // 99.95% uptime
    
    console.log('\n🎉 Launch Day execution completed successfully!');
    console.log('📈 Real-time monitoring is now active');
    
    return {
      verification: 'passed',
      tasks: 'completed',
      monitoring: 'active',
      metrics: this.metrics.getStatus()
    };
  }

  async runPostLaunchMonitoring() {
    console.log('📊 Starting Post-Launch Monitoring...\n');
    
    // Monitor for 24 hours (simulate with shorter intervals)
    const monitoringDuration = 24 * 60 * 60 * 1000; // 24 hours
    const checkInterval = 60 * 1000; // 1 minute
    
    console.log('🔍 Monitoring system health, performance, and metrics...');
    console.log('Press Ctrl+C to stop monitoring\n');
    
    const startTime = Date.now();
    
    const monitoringLoop = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = monitoringDuration - elapsed;
      
      if (remaining <= 0) {
        clearInterval(monitoringLoop);
        this.alerts.stopMonitoring();
        console.log('\n✅ 24-hour post-launch monitoring completed');
        this.generateLaunchReport();
        return;
      }
      
      // Display current status
      const status = this.metrics.getStatus();
      const alerts = this.alerts.getAlertSummary();
      
      console.log(`⏰ Monitoring... ${Math.round(remaining / (60 * 60 * 1000))}h remaining`);
      console.log(`📊 Health: ${status.overallHealth.toFixed(1)}% | Active Alerts: ${alerts.active}`);
    }, checkInterval);
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      clearInterval(monitoringLoop);
      this.alerts.stopMonitoring();
      console.log('\n🛑 Monitoring stopped by user');
      this.generateLaunchReport();
      process.exit(0);
    });
  }

  generateLaunchReport() {
    const status = this.metrics.getStatus();
    const alerts = this.alerts.getAlertSummary();
    const tasks = this.tasks.getProgress();
    
    console.log('\n📋 LAUNCH REPORT');
    console.log('================');
    console.log(`Overall Health: ${status.overallHealth.toFixed(1)}%`);
    console.log(`Tasks Completed: ${tasks.completed}/${tasks.total} (${tasks.percentage}%)`);
    console.log(`Total Alerts: ${alerts.total}`);
    console.log(`Critical Alerts: ${alerts.critical}`);
    console.log(`System Status: ${status.overallHealth >= 80 ? '✅ HEALTHY' : '⚠️  NEEDS ATTENTION'}`);
    
    console.log('\n📊 Key Metrics:');
    console.log(`• Conversion Rate: ${status.metrics.conversionRate.toFixed(2)}%`);
    console.log(`• Page Load Speed: ${(status.metrics.pageLoadSpeed/1000).toFixed(2)}s`);
    console.log(`• Customer Satisfaction: ${status.metrics.customerSatisfaction.toFixed(1)}/5`);
    console.log(`• Order Accuracy: ${status.metrics.orderAccuracy.toFixed(2)}%`);
    console.log(`• System Uptime: ${status.metrics.systemUptime.toFixed(2)}%`);
  }
}

// CLI Interface
async function main() {
  const runner = new LaunchRunner();
  const command = process.argv[2];
  
  switch (command) {
    case 'verify':
      await runner.runPreLaunchVerification();
      break;
    case 'launch':
      await runner.runPreLaunchVerification();
      await runner.executeLaunchDay();
      break;
    case 'monitor':
      await runner.runPostLaunchMonitoring();
      break;
    case 'full':
      await runner.runPreLaunchVerification();
      await runner.executeLaunchDay();
      await runner.runPostLaunchMonitoring();
      break;
    default:
      console.log('🚀 Household Planet Kenya - Launch Runner');
      console.log('\nUsage:');
      console.log('  node launch-runner.js verify   - Run pre-launch verification');
      console.log('  node launch-runner.js launch   - Execute launch day tasks');
      console.log('  node launch-runner.js monitor  - Start post-launch monitoring');
      console.log('  node launch-runner.js full     - Run complete launch sequence');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = LaunchRunner;