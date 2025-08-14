const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

class SecurityAlertSystem {
    constructor() {
        this.alertThresholds = {
            failedLogins: 5,
            suspiciousIPs: 3,
            diskUsage: 90,
            memoryUsage: 85,
            cpuUsage: 90
        };
        
        this.emailConfig = {
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.ALERT_EMAIL_USER,
                pass: process.env.ALERT_EMAIL_PASS
            }
        };
        
        this.alertRecipients = [
            process.env.ADMIN_EMAIL || 'admin@householdplanet.co.ke'
        ];
        
        this.logFile = '/var/log/security-alerts.log';
    }

    async sendAlert(severity, title, message, details = {}) {
        const timestamp = new Date().toISOString();
        const alertData = {
            timestamp,
            severity,
            title,
            message,
            details,
            hostname: require('os').hostname()
        };

        // Log alert
        this.logAlert(alertData);

        // Send email for high severity alerts
        if (severity === 'HIGH' || severity === 'CRITICAL') {
            await this.sendEmailAlert(alertData);
        }

        // Send to monitoring system (webhook)
        await this.sendWebhookAlert(alertData);
    }

    logAlert(alertData) {
        const logEntry = `${alertData.timestamp} [${alertData.severity}] ${alertData.title}: ${alertData.message}\n`;
        
        try {
            fs.appendFileSync(this.logFile, logEntry);
        } catch (error) {
            console.error('Failed to write to security log:', error);
        }
    }

    async sendEmailAlert(alertData) {
        try {
            const transporter = nodemailer.createTransporter(this.emailConfig);
            
            const emailContent = `
                <h2>🚨 Security Alert - ${alertData.severity}</h2>
                <p><strong>Time:</strong> ${alertData.timestamp}</p>
                <p><strong>Server:</strong> ${alertData.hostname}</p>
                <p><strong>Alert:</strong> ${alertData.title}</p>
                <p><strong>Message:</strong> ${alertData.message}</p>
                
                ${Object.keys(alertData.details).length > 0 ? `
                <h3>Details:</h3>
                <pre>${JSON.stringify(alertData.details, null, 2)}</pre>
                ` : ''}
                
                <p><em>This is an automated security alert from Household Planet Kenya.</em></p>
            `;

            for (const recipient of this.alertRecipients) {
                await transporter.sendMail({
                    from: this.emailConfig.auth.user,
                    to: recipient,
                    subject: `🚨 Security Alert: ${alertData.title}`,
                    html: emailContent
                });
            }
        } catch (error) {
            console.error('Failed to send email alert:', error);
        }
    }

    async sendWebhookAlert(alertData) {
        const webhookUrl = process.env.SECURITY_WEBHOOK_URL;
        if (!webhookUrl) return;

        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.WEBHOOK_TOKEN}`
                },
                body: JSON.stringify(alertData)
            });

            if (!response.ok) {
                throw new Error(`Webhook failed: ${response.status}`);
            }
        } catch (error) {
            console.error('Failed to send webhook alert:', error);
        }
    }

    // Monitor failed login attempts
    async monitorFailedLogins() {
        try {
            const authLog = fs.readFileSync('/var/log/auth.log', 'utf8');
            const today = new Date().toDateString();
            const failedAttempts = authLog
                .split('\n')
                .filter(line => 
                    line.includes('Failed password') && 
                    line.includes(today)
                ).length;

            if (failedAttempts >= this.alertThresholds.failedLogins) {
                await this.sendAlert(
                    'HIGH',
                    'Multiple Failed Login Attempts',
                    `${failedAttempts} failed login attempts detected today`,
                    { failedAttempts, threshold: this.alertThresholds.failedLogins }
                );
            }
        } catch (error) {
            console.error('Failed to monitor login attempts:', error);
        }
    }

    // Monitor system resources
    async monitorSystemResources() {
        try {
            const os = require('os');
            
            // Check memory usage
            const totalMem = os.totalmem();
            const freeMem = os.freemem();
            const memoryUsage = ((totalMem - freeMem) / totalMem) * 100;

            if (memoryUsage >= this.alertThresholds.memoryUsage) {
                await this.sendAlert(
                    'MEDIUM',
                    'High Memory Usage',
                    `Memory usage is at ${memoryUsage.toFixed(2)}%`,
                    { memoryUsage, threshold: this.alertThresholds.memoryUsage }
                );
            }

            // Check disk usage
            const { execSync } = require('child_process');
            const diskUsage = execSync("df / | awk 'NR==2 {print $5}' | sed 's/%//'", { encoding: 'utf8' });
            const diskUsagePercent = parseInt(diskUsage.trim());

            if (diskUsagePercent >= this.alertThresholds.diskUsage) {
                await this.sendAlert(
                    'HIGH',
                    'High Disk Usage',
                    `Disk usage is at ${diskUsagePercent}%`,
                    { diskUsage: diskUsagePercent, threshold: this.alertThresholds.diskUsage }
                );
            }
        } catch (error) {
            console.error('Failed to monitor system resources:', error);
        }
    }

    // Monitor suspicious network activity
    async monitorNetworkActivity() {
        try {
            const { execSync } = require('child_process');
            
            // Check for unusual network connections
            const connections = execSync('netstat -tuln | grep LISTEN | wc -l', { encoding: 'utf8' });
            const connectionCount = parseInt(connections.trim());

            if (connectionCount > 20) {
                await this.sendAlert(
                    'MEDIUM',
                    'Unusual Network Activity',
                    `${connectionCount} listening ports detected`,
                    { connectionCount }
                );
            }

            // Check for failed SSH attempts
            const sshFailures = execSync("grep 'Failed password' /var/log/auth.log | grep '$(date +%Y-%m-%d)' | wc -l", { encoding: 'utf8' });
            const sshFailureCount = parseInt(sshFailures.trim());

            if (sshFailureCount > 10) {
                await this.sendAlert(
                    'HIGH',
                    'Multiple SSH Failures',
                    `${sshFailureCount} SSH failures detected today`,
                    { sshFailureCount }
                );
            }
        } catch (error) {
            console.error('Failed to monitor network activity:', error);
        }
    }

    // Check for malware signatures
    async scanForMalware() {
        try {
            const { execSync } = require('child_process');
            
            // Run basic malware scan
            const suspiciousFiles = execSync("find /tmp /var/tmp -name '*.php' -o -name '*.sh' | head -10", { encoding: 'utf8' });
            
            if (suspiciousFiles.trim()) {
                await this.sendAlert(
                    'MEDIUM',
                    'Suspicious Files Detected',
                    'Potentially suspicious files found in temp directories',
                    { files: suspiciousFiles.split('\n').filter(f => f.trim()) }
                );
            }
        } catch (error) {
            console.error('Failed to scan for malware:', error);
        }
    }

    // Run all monitoring checks
    async runSecurityChecks() {
        console.log('Running security monitoring checks...');
        
        await this.monitorFailedLogins();
        await this.monitorSystemResources();
        await this.monitorNetworkActivity();
        await this.scanForMalware();
        
        console.log('Security monitoring checks completed');
    }

    // Start continuous monitoring
    startMonitoring(intervalMinutes = 15) {
        console.log(`Starting security monitoring (every ${intervalMinutes} minutes)`);
        
        // Run initial check
        this.runSecurityChecks();
        
        // Schedule regular checks
        setInterval(() => {
            this.runSecurityChecks();
        }, intervalMinutes * 60 * 1000);
    }
}

module.exports = SecurityAlertSystem;

// If running directly
if (require.main === module) {
    const alertSystem = new SecurityAlertSystem();
    alertSystem.startMonitoring();
}