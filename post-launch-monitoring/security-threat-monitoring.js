// Security Threat Monitoring System
const axios = require('axios');
const crypto = require('crypto');

class SecurityMonitor {
  constructor() {
    this.threatLevels = {
      LOW: 1,
      MEDIUM: 2,
      HIGH: 3,
      CRITICAL: 4
    };
    
    this.suspiciousPatterns = {
      bruteForce: /^(POST|PUT) \/api\/auth\/(login|register)/,
      sqlInjection: /(union|select|insert|delete|drop|create|alter|exec|script)/i,
      xssAttempt: /(<script|javascript:|onload=|onerror=)/i,
      pathTraversal: /(\.\.\/|\.\.\\)/,
      commandInjection: /(;|\||&|`|\$\()/
    };
    
    this.rateLimits = {
      login: { requests: 5, window: 300000 }, // 5 requests per 5 minutes
      api: { requests: 100, window: 60000 }, // 100 requests per minute
      registration: { requests: 3, window: 3600000 } // 3 registrations per hour
    };
    
    this.ipTracker = new Map();
  }

  async collectSecurityLogs() {
    try {
      const response = await axios.get('https://householdplanetkenya.co.ke/api/admin/security/logs', {
        params: { since: new Date(Date.now() - 300000).toISOString() } // Last 5 minutes
      });
      
      return response.data.logs || [];
    } catch (error) {
      console.error('Failed to collect security logs:', error);
      return [];
    }
  }

  async collectFailedLogins() {
    try {
      const response = await axios.get('https://householdplanetkenya.co.ke/api/admin/security/failed-logins');
      return response.data.attempts || [];
    } catch (error) {
      console.error('Failed to collect failed login attempts:', error);
      return [];
    }
  }

  async collectSuspiciousRequests() {
    try {
      const response = await axios.get('https://householdplanetkenya.co.ke/api/admin/security/suspicious-requests');
      return response.data.requests || [];
    } catch (error) {
      console.error('Failed to collect suspicious requests:', error);
      return [];
    }
  }

  analyzeSecurityThreats(logs, failedLogins, suspiciousRequests) {
    const threats = [];
    
    // Analyze failed login attempts
    const loginThreats = this.analyzeBruteForceAttempts(failedLogins);
    threats.push(...loginThreats);
    
    // Analyze suspicious requests
    const requestThreats = this.analyzeSuspiciousRequests(suspiciousRequests);
    threats.push(...requestThreats);
    
    // Analyze rate limiting violations
    const rateLimitThreats = this.analyzeRateLimitViolations(logs);
    threats.push(...rateLimitThreats);
    
    // Analyze IP patterns
    const ipThreats = this.analyzeIPPatterns(logs);
    threats.push(...ipThreats);
    
    return threats;
  }

  analyzeBruteForceAttempts(failedLogins) {
    const threats = [];
    const ipAttempts = new Map();
    
    failedLogins.forEach(attempt => {
      const ip = attempt.ip;
      if (!ipAttempts.has(ip)) {
        ipAttempts.set(ip, []);
      }
      ipAttempts.get(ip).push(attempt);
    });
    
    ipAttempts.forEach((attempts, ip) => {
      if (attempts.length >= 10) { // 10+ failed attempts
        threats.push({
          type: 'BRUTE_FORCE_ATTACK',
          severity: this.threatLevels.HIGH,
          ip,
          attempts: attempts.length,
          timeWindow: this.getTimeWindow(attempts),
          description: `${attempts.length} failed login attempts from ${ip}`
        });
      }
    });
    
    return threats;
  }

  analyzeSuspiciousRequests(requests) {
    const threats = [];
    
    requests.forEach(request => {
      const { url, method, userAgent, ip, payload } = request;
      
      // Check for SQL injection attempts
      if (this.suspiciousPatterns.sqlInjection.test(url) || 
          this.suspiciousPatterns.sqlInjection.test(payload)) {
        threats.push({
          type: 'SQL_INJECTION_ATTEMPT',
          severity: this.threatLevels.HIGH,
          ip,
          url,
          description: `SQL injection attempt detected from ${ip}`
        });
      }
      
      // Check for XSS attempts
      if (this.suspiciousPatterns.xssAttempt.test(url) || 
          this.suspiciousPatterns.xssAttempt.test(payload)) {
        threats.push({
          type: 'XSS_ATTEMPT',
          severity: this.threatLevels.MEDIUM,
          ip,
          url,
          description: `XSS attempt detected from ${ip}`
        });
      }
      
      // Check for path traversal
      if (this.suspiciousPatterns.pathTraversal.test(url)) {
        threats.push({
          type: 'PATH_TRAVERSAL_ATTEMPT',
          severity: this.threatLevels.MEDIUM,
          ip,
          url,
          description: `Path traversal attempt detected from ${ip}`
        });
      }
      
      // Check for suspicious user agents
      if (this.isSuspiciousUserAgent(userAgent)) {
        threats.push({
          type: 'SUSPICIOUS_USER_AGENT',
          severity: this.threatLevels.LOW,
          ip,
          userAgent,
          description: `Suspicious user agent detected from ${ip}`
        });
      }
    });
    
    return threats;
  }

  analyzeRateLimitViolations(logs) {
    const threats = [];
    const ipRequests = new Map();
    
    logs.forEach(log => {
      const ip = log.ip;
      if (!ipRequests.has(ip)) {
        ipRequests.set(ip, []);
      }
      ipRequests.get(ip).push(log);
    });
    
    ipRequests.forEach((requests, ip) => {
      const recentRequests = requests.filter(r => 
        new Date(r.timestamp) > new Date(Date.now() - 60000) // Last minute
      );
      
      if (recentRequests.length > 200) { // More than 200 requests per minute
        threats.push({
          type: 'RATE_LIMIT_VIOLATION',
          severity: this.threatLevels.MEDIUM,
          ip,
          requestCount: recentRequests.length,
          description: `${recentRequests.length} requests in 1 minute from ${ip}`
        });
      }
    });
    
    return threats;
  }

  analyzeIPPatterns(logs) {
    const threats = [];
    const ipCountries = new Map();
    
    // Group requests by IP and analyze patterns
    logs.forEach(log => {
      const ip = log.ip;
      if (!ipCountries.has(ip)) {
        ipCountries.set(ip, {
          requests: [],
          country: log.country,
          endpoints: new Set()
        });
      }
      
      const ipData = ipCountries.get(ip);
      ipData.requests.push(log);
      ipData.endpoints.add(log.endpoint);
    });
    
    ipCountries.forEach((data, ip) => {
      // Check for distributed attacks
      if (data.endpoints.size > 20 && data.requests.length > 100) {
        threats.push({
          type: 'DISTRIBUTED_ATTACK',
          severity: this.threatLevels.HIGH,
          ip,
          endpointsHit: data.endpoints.size,
          requestCount: data.requests.length,
          description: `Potential distributed attack from ${ip} (${data.country})`
        });
      }
      
      // Check for reconnaissance
      if (data.endpoints.size > 10 && data.requests.length < 50) {
        threats.push({
          type: 'RECONNAISSANCE',
          severity: this.threatLevels.MEDIUM,
          ip,
          endpointsHit: data.endpoints.size,
          description: `Potential reconnaissance activity from ${ip}`
        });
      }
    });
    
    return threats;
  }

  isSuspiciousUserAgent(userAgent) {
    const suspiciousAgents = [
      'sqlmap',
      'nikto',
      'nmap',
      'masscan',
      'curl/7', // Basic curl requests
      'python-requests',
      'bot',
      'crawler',
      'scanner'
    ];
    
    return suspiciousAgents.some(agent => 
      userAgent.toLowerCase().includes(agent.toLowerCase())
    );
  }

  getTimeWindow(attempts) {
    const timestamps = attempts.map(a => new Date(a.timestamp));
    const earliest = Math.min(...timestamps);
    const latest = Math.max(...timestamps);
    return (latest - earliest) / 1000; // seconds
  }

  async handleThreat(threat) {
    console.log(`🚨 Security Threat Detected: ${threat.type} (${threat.severity})`);
    
    // Auto-block critical threats
    if (threat.severity >= this.threatLevels.HIGH) {
      await this.blockIP(threat.ip, threat.type);
    }
    
    // Send alerts
    await this.sendSecurityAlert(threat);
    
    // Log threat
    await this.logThreat(threat);
  }

  async blockIP(ip, reason) {
    try {
      await axios.post('https://householdplanetkenya.co.ke/api/admin/security/block-ip', {
        ip,
        reason,
        duration: 3600000, // 1 hour
        automatic: true
      });
      
      console.log(`🛡️ Blocked IP ${ip} for ${reason}`);
    } catch (error) {
      console.error('Failed to block IP:', error);
    }
  }

  async sendSecurityAlert(threat) {
    const severityEmoji = {
      1: '🟡',
      2: '🟠',
      3: '🔴',
      4: '🚨'
    };
    
    try {
      await axios.post(process.env.SLACK_WEBHOOK_URL, {
        text: `${severityEmoji[threat.severity]} Security Alert: ${threat.type}`,
        channel: '#security-alerts',
        attachments: [{
          color: threat.severity >= 3 ? 'danger' : 'warning',
          fields: [
            { title: 'Threat Type', value: threat.type, short: true },
            { title: 'Severity', value: threat.severity.toString(), short: true },
            { title: 'Source IP', value: threat.ip || 'Unknown', short: true },
            { title: 'Description', value: threat.description, short: false }
          ]
        }]
      });
    } catch (error) {
      console.error('Failed to send security alert:', error);
    }
    
    // Send email for critical threats
    if (threat.severity >= this.threatLevels.CRITICAL) {
      try {
        await axios.post('https://householdplanetkenya.co.ke/api/notifications/email', {
          to: 'security@householdplanetkenya.co.ke',
          subject: `CRITICAL Security Alert: ${threat.type}`,
          body: `
Critical security threat detected:

Type: ${threat.type}
Severity: ${threat.severity}
Source IP: ${threat.ip}
Description: ${threat.description}
Time: ${new Date().toISOString()}

Immediate action may be required.
          `
        });
      } catch (error) {
        console.error('Failed to send security email:', error);
      }
    }
  }

  async logThreat(threat) {
    try {
      await axios.post('https://householdplanetkenya.co.ke/api/admin/security/log-threat', {
        ...threat,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log threat:', error);
    }
  }

  async monitorSecurity() {
    console.log('🔍 Monitoring security threats...');
    
    const logs = await this.collectSecurityLogs();
    const failedLogins = await this.collectFailedLogins();
    const suspiciousRequests = await this.collectSuspiciousRequests();
    
    const threats = this.analyzeSecurityThreats(logs, failedLogins, suspiciousRequests);
    
    if (threats.length > 0) {
      console.log(`⚠️ Found ${threats.length} security threats`);
      
      for (const threat of threats) {
        await this.handleThreat(threat);
      }
    } else {
      console.log('✅ No security threats detected');
    }
  }

  startSecurityMonitoring() {
    console.log('🛡️ Starting security threat monitoring...');
    
    // Monitor every 2 minutes
    setInterval(() => {
      this.monitorSecurity();
    }, 120000);
    
    // Generate security report daily
    setInterval(() => {
      this.generateSecurityReport();
    }, 86400000);
  }

  async generateSecurityReport() {
    console.log('📋 Generating daily security report...');
    // Implementation for daily security summary
  }
}

// Start security monitoring
const securityMonitor = new SecurityMonitor();
securityMonitor.startSecurityMonitoring();

module.exports = SecurityMonitor;