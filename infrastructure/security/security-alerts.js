// Security monitoring and alerting system
const nodemailer = require('nodemailer');
const fs = require('fs');

class SecurityMonitor {
  constructor() {
    this.alertThresholds = {
      failedLogins: 10,
      suspiciousIPs: 5,
      highCPU: 80,
      diskUsage: 90
    };
  }

  async checkSecurityMetrics() {
    const metrics = {
      failedLogins: await this.getFailedLoginCount(),
      suspiciousActivity: await this.getSuspiciousActivity(),
      systemHealth: await this.getSystemHealth()
    };

    if (metrics.failedLogins > this.alertThresholds.failedLogins) {
      await this.sendAlert('HIGH_FAILED_LOGINS', metrics.failedLogins);
    }

    if (metrics.systemHealth.cpu > this.alertThresholds.highCPU) {
      await this.sendAlert('HIGH_CPU_USAGE', metrics.systemHealth.cpu);
    }
  }

  async sendAlert(type, data) {
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.ALERT_EMAIL,
        pass: process.env.ALERT_PASSWORD
      }
    });

    await transporter.sendMail({
      from: 'security@householdplanetkenya.co.ke',
      to: 'admin@householdplanetkenya.co.ke',
      subject: `Security Alert: ${type}`,
      text: `Security event detected: ${type}\nData: ${JSON.stringify(data)}`
    });
  }

  async getFailedLoginCount() {
    // Parse auth logs for failed attempts
    return 0; // Placeholder
  }

  async getSuspiciousActivity() {
    // Check for suspicious patterns
    return []; // Placeholder
  }

  async getSystemHealth() {
    return { cpu: 45, memory: 60, disk: 30 }; // Placeholder
  }
}

// Run monitoring every 5 minutes
setInterval(() => {
  new SecurityMonitor().checkSecurityMetrics();
}, 5 * 60 * 1000);