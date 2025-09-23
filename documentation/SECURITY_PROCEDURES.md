# Security Procedures - Household Planet Kenya

## Security Framework Overview

### Security Principles
- **Defense in Depth**: Multiple layers of security controls
- **Least Privilege**: Minimum necessary access rights
- **Zero Trust**: Verify everything, trust nothing
- **Continuous Monitoring**: Real-time threat detection
- **Incident Response**: Rapid response to security events

### Compliance Standards
- **PCI DSS**: Payment card industry compliance
- **GDPR**: Data protection regulations
- **ISO 27001**: Information security management
- **OWASP**: Web application security standards

---

## Access Control and Authentication

### User Authentication

**Password Policy:**
- Minimum 12 characters
- Must include uppercase, lowercase, numbers, and symbols
- No common passwords or dictionary words
- Password expiry: 90 days for admin accounts
- Account lockout: 5 failed attempts, 30-minute lockout

**Multi-Factor Authentication (MFA):**
- Required for all admin accounts
- Optional for customer accounts
- Supported methods: SMS, authenticator apps, email
- Backup codes provided for account recovery

**Session Management:**
```javascript
// JWT Configuration
{
  expiresIn: '15m', // Access token
  refreshExpiresIn: '7d', // Refresh token
  issuer: 'householdplanetkenya.co.ke',
  audience: 'householdplanet-users'
}
```

### Role-Based Access Control (RBAC)

**User Roles:**

**SUPER_ADMIN**
- Full system access
- User management
- System configuration
- Security settings

**ADMIN**
- Product management
- Order processing
- Customer management
- Reports access

**MANAGER**
- Order processing
- Customer support
- Inventory management
- Limited reports

**SUPPORT**
- Customer inquiries
- Order status updates
- Basic troubleshooting

**CUSTOMER**
- Account management
- Order placement
- Order tracking

### API Security

**Authentication Headers:**
```http
Authorization: Bearer <jwt_token>
X-API-Key: <api_key>
X-Request-ID: <unique_request_id>
```

**Rate Limiting:**
```javascript
// Rate limits by endpoint
const rateLimits = {
  '/api/auth/login': { requests: 5, window: '15m' },
  '/api/auth/register': { requests: 3, window: '1h' },
  '/api/products': { requests: 100, window: '1m' },
  '/api/orders': { requests: 20, window: '1m' },
  '/api/payments': { requests: 10, window: '1m' }
};
```

---

## Data Protection and Privacy

### Data Classification

**Public Data:**
- Product information
- General company information
- Marketing content

**Internal Data:**
- System logs
- Performance metrics
- Internal communications

**Confidential Data:**
- Customer personal information
- Order details
- Payment information

**Restricted Data:**
- Authentication credentials
- API keys
- Financial records
- Security configurations

### Data Encryption

**Data at Rest:**
- Database: AES-256 encryption
- File storage: Server-side encryption
- Backups: Encrypted before storage
- Configuration files: Encrypted sensitive values

**Data in Transit:**
- TLS 1.3 for all communications
- Certificate pinning for mobile apps
- HSTS headers enforced
- Perfect Forward Secrecy enabled

**Encryption Implementation:**
```javascript
// Sensitive data encryption
const crypto = require('crypto');

function encryptSensitiveData(data) {
  const algorithm = 'aes-256-gcm';
  const key = process.env.ENCRYPTION_KEY;
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipher(algorithm, key, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: cipher.getAuthTag().toString('hex')
  };
}
```

### Personal Data Handling

**Data Collection:**
- Collect only necessary data
- Explicit consent for data processing
- Clear privacy policy
- Opt-in for marketing communications

**Data Retention:**
- Customer data: 7 years after account closure
- Transaction data: 10 years for compliance
- Log data: 90 days
- Backup data: 30 days

**Data Subject Rights:**
- Right to access personal data
- Right to rectification
- Right to erasure ("right to be forgotten")
- Right to data portability
- Right to object to processing

---

## Network Security

### Firewall Configuration

**Inbound Rules:**
```bash
# Allow HTTP/HTTPS
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# Allow SSH (custom port)
iptables -A INPUT -p tcp --dport 2222 -j ACCEPT

# Block all other inbound traffic
iptables -A INPUT -j DROP
```

**Outbound Rules:**
```bash
# Allow DNS
iptables -A OUTPUT -p udp --dport 53 -j ACCEPT

# Allow HTTP/HTTPS for API calls
iptables -A OUTPUT -p tcp --dport 80 -j ACCEPT
iptables -A OUTPUT -p tcp --dport 443 -j ACCEPT

# Allow email (SMTP)
iptables -A OUTPUT -p tcp --dport 587 -j ACCEPT
```

### DDoS Protection

**Cloudflare Configuration:**
- DDoS protection enabled
- Rate limiting rules
- Bot management
- Web Application Firewall (WAF)

**Application-Level Protection:**
```javascript
// Express rate limiting
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});
```

### SSL/TLS Configuration

**Certificate Management:**
- Let's Encrypt certificates
- Automatic renewal
- Certificate transparency monitoring
- OCSP stapling enabled

**TLS Settings:**
```nginx
# Nginx SSL configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;

# Security headers
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Frame-Options DENY always;
add_header X-Content-Type-Options nosniff always;
add_header X-XSS-Protection "1; mode=block" always;
```

---

## Application Security

### Input Validation and Sanitization

**Validation Rules:**
```javascript
// Input validation schema
const userSchema = {
  email: {
    type: 'string',
    format: 'email',
    maxLength: 255
  },
  password: {
    type: 'string',
    minLength: 12,
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'
  },
  phone: {
    type: 'string',
    pattern: '^\\+254[0-9]{9}$'
  }
};
```

**SQL Injection Prevention:**
```javascript
// Using parameterized queries
const query = 'SELECT * FROM users WHERE email = $1 AND active = $2';
const values = [email, true];
const result = await db.query(query, values);
```

**XSS Prevention:**
```javascript
// Content Security Policy
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
  );
  next();
});
```

### Secure Coding Practices

**Error Handling:**
```javascript
// Secure error responses
app.use((error, req, res, next) => {
  // Log full error details
  logger.error('Application error:', error);
  
  // Return generic error to client
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An internal error occurred'
    }
  });
});
```

**Sensitive Data Handling:**
```javascript
// Remove sensitive data from responses
function sanitizeUser(user) {
  const { password, resetToken, ...sanitized } = user;
  return sanitized;
}
```

---

## Payment Security

### PCI DSS Compliance

**Requirements:**
1. Install and maintain a firewall configuration
2. Do not use vendor-supplied defaults for system passwords
3. Protect stored cardholder data
4. Encrypt transmission of cardholder data
5. Use and regularly update anti-virus software
6. Develop and maintain secure systems and applications

**Implementation:**
- No storage of full PAN (Primary Account Number)
- Tokenization of payment data
- Secure payment processing through certified providers
- Regular security assessments

### M-Pesa Integration Security

**API Security:**
```javascript
// M-Pesa API authentication
const generateToken = async () => {
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  
  const response = await axios.get(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    {
      headers: {
        'Authorization': `Basic ${auth}`
      }
    }
  );
  
  return response.data.access_token;
};
```

**Transaction Validation:**
```javascript
// Validate M-Pesa callback
const validateCallback = (callbackData) => {
  const { Body } = callbackData;
  const { stkCallback } = Body;
  
  // Verify merchant request ID
  if (!isValidMerchantRequest(stkCallback.MerchantRequestID)) {
    throw new Error('Invalid merchant request');
  }
  
  // Verify result code
  if (stkCallback.ResultCode !== 0) {
    throw new Error('Transaction failed');
  }
  
  return true;
};
```

---

## Monitoring and Incident Response

### Security Monitoring

**Log Collection:**
```javascript
// Security event logging
const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'security.log' }),
    new winston.transports.Console()
  ]
});

// Log security events
securityLogger.info('Login attempt', {
  userId: user.id,
  ip: req.ip,
  userAgent: req.get('User-Agent'),
  success: true
});
```

**Threat Detection:**
```javascript
// Brute force detection
const loginAttempts = new Map();

const detectBruteForce = (ip) => {
  const attempts = loginAttempts.get(ip) || [];
  const recentAttempts = attempts.filter(
    attempt => Date.now() - attempt < 15 * 60 * 1000 // 15 minutes
  );
  
  if (recentAttempts.length >= 5) {
    // Block IP and alert security team
    blockIP(ip);
    alertSecurityTeam('Brute force detected', { ip, attempts: recentAttempts.length });
  }
  
  loginAttempts.set(ip, [...recentAttempts, Date.now()]);
};
```

### Incident Response Plan

**Incident Classification:**

**Level 1 - Low Impact:**
- Single user account compromise
- Minor configuration issues
- Non-critical system alerts

**Level 2 - Medium Impact:**
- Multiple account compromises
- Service degradation
- Data integrity issues

**Level 3 - High Impact:**
- System-wide compromise
- Data breach
- Service outage
- Payment system compromise

**Response Procedures:**

**Immediate Response (0-1 hour):**
1. Identify and contain the incident
2. Assess impact and classify severity
3. Notify incident response team
4. Begin evidence collection
5. Implement temporary fixes if needed

**Short-term Response (1-24 hours):**
1. Detailed investigation
2. Root cause analysis
3. Implement permanent fixes
4. Notify affected customers (if required)
5. Document incident details

**Long-term Response (1-7 days):**
1. Post-incident review
2. Update security procedures
3. Implement preventive measures
4. Staff training updates
5. Compliance reporting

### Security Incident Communication

**Internal Communication:**
```
SECURITY INCIDENT ALERT

Incident ID: SEC-2024-001
Severity: HIGH
Time: 2024-01-01 14:30 EAT
Status: INVESTIGATING

Description: Suspicious login attempts detected from multiple IPs

Actions Taken:
- Suspicious IPs blocked
- Affected accounts secured
- Investigation ongoing

Next Steps:
- Complete forensic analysis
- Review access logs
- Update security measures

Contact: security@householdplanetkenya.co.ke
```

**Customer Communication:**
```
Security Notice

We recently detected and blocked suspicious activity on our platform. 
Your account security is our top priority.

What happened:
- Unauthorized login attempts were detected
- Our security systems automatically blocked the attempts
- No customer data was compromised

What we're doing:
- Enhanced monitoring is in place
- Security measures have been strengthened
- We're working with security experts

What you should do:
- Change your password if you haven't recently
- Enable two-factor authentication
- Report any suspicious activity

We apologize for any concern this may cause and appreciate your understanding.

Household Planet Kenya Security Team
```

---

## Vulnerability Management

### Security Assessments

**Regular Assessments:**
- **Weekly**: Automated vulnerability scans
- **Monthly**: Manual security testing
- **Quarterly**: Penetration testing
- **Annually**: Comprehensive security audit

**Vulnerability Scanning:**
```bash
# Automated security scanning
#!/bin/bash

# OWASP ZAP scan
zap-baseline.py -t https://householdplanetkenya.co.ke

# Nmap port scan
nmap -sS -O householdplanetkenya.co.ke

# SSL/TLS testing
testssl.sh householdplanetkenya.co.ke

# Generate report
echo "Security scan completed: $(date)" >> security-scan.log
```

### Patch Management

**Patch Schedule:**
- **Critical**: Within 24 hours
- **High**: Within 7 days
- **Medium**: Within 30 days
- **Low**: Next maintenance window

**Update Process:**
1. Test patches in staging environment
2. Schedule maintenance window
3. Apply patches to production
4. Verify system functionality
5. Monitor for issues

---

## Security Training and Awareness

### Staff Training Program

**New Employee Training:**
- Security policies and procedures
- Password management
- Phishing awareness
- Incident reporting
- Data handling procedures

**Ongoing Training:**
- Monthly security updates
- Quarterly phishing simulations
- Annual security awareness training
- Role-specific security training

### Security Policies

**Acceptable Use Policy:**
- Authorized use of company systems
- Prohibited activities
- Personal use guidelines
- Monitoring and enforcement

**Data Handling Policy:**
- Data classification guidelines
- Access control requirements
- Data retention policies
- Breach notification procedures

**Incident Response Policy:**
- Incident identification and reporting
- Response procedures
- Communication protocols
- Recovery procedures

---

## Compliance and Auditing

### Audit Logging

**Audit Events:**
```javascript
// Audit log structure
const auditLog = {
  timestamp: new Date().toISOString(),
  userId: user.id,
  action: 'LOGIN_SUCCESS',
  resource: 'user_account',
  ip: req.ip,
  userAgent: req.get('User-Agent'),
  details: {
    sessionId: session.id,
    mfaUsed: true
  }
};
```

**Log Retention:**
- Security logs: 2 years
- Audit logs: 7 years
- Access logs: 1 year
- Error logs: 6 months

### Compliance Reporting

**Monthly Reports:**
- Security incident summary
- Vulnerability assessment results
- Access review findings
- Training completion status

**Quarterly Reports:**
- Compliance status assessment
- Risk assessment updates
- Security metrics analysis
- Improvement recommendations

**Annual Reports:**
- Comprehensive security review
- Compliance certification
- Third-party audit results
- Security program effectiveness

---

## Emergency Procedures

### Security Breach Response

**Immediate Actions:**
1. Isolate affected systems
2. Preserve evidence
3. Notify incident response team
4. Begin containment procedures
5. Document all actions

**Communication Plan:**
- Internal: Security team, management, legal
- External: Customers, partners, regulators
- Media: Prepared statements, spokesperson

### Business Continuity

**Backup Systems:**
- Hot standby systems ready
- Data replication active
- Alternative communication channels
- Remote work capabilities

**Recovery Procedures:**
- System restoration from backups
- Data integrity verification
- Service restoration testing
- Customer communication

---

*This security procedures document should be reviewed and updated quarterly to address evolving threats and regulatory requirements.*