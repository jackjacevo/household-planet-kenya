# API Security Documentation

## Overview

This document outlines the comprehensive security measures implemented in the Household Planet Kenya API.

## Authentication & Authorization

### JWT Authentication
- **Type**: Bearer Token (JWT)
- **Header**: `Authorization: Bearer <token>`
- **Expiration**: 7 days (configurable)
- **Refresh**: Required after expiration

### Enhanced Security Features
- Token age validation
- IP address monitoring
- User agent tracking
- Automatic token invalidation on suspicious activity

## API Versioning

### Current Version
- **Active**: v1
- **Header**: `API-Version: v1`
- **Query Parameter**: `?version=v1`

### Deprecation Policy
- Deprecated versions supported for 6 months
- Deprecation headers automatically added
- Migration guides provided

## Rate Limiting

### Default Limits
- **Unauthenticated**: 100 requests per 15 minutes
- **Authenticated**: 1000 requests per 15 minutes
- **Sensitive endpoints**: 10 requests per minute

### Headers
- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset timestamp

## CORS Configuration

### Allowed Origins
- `http://localhost:3000` (development)
- `https://household-planet-kenya.vercel.app`
- `https://householdplanetkenya.co.ke`

### Security Headers
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Request/Response Logging

### Security Monitoring
- All requests logged with security context
- Suspicious activity detection
- Automated alerts for security events
- Audit trail for sensitive operations

### Logged Information
- Request method and URL
- User ID and IP address
- User agent and timestamp
- Response status and duration
- Error details (sanitized)

## Input Validation & Sanitization

### Validation Rules
- All input validated using class-validator
- Custom security validators for sensitive data
- Automatic sanitization of dangerous content
- SQL injection prevention

### Security Patterns Detected
- Path traversal attempts (`../`)
- XSS attempts (`<script>`)
- SQL injection (`union select`)
- JavaScript injection (`javascript:`)

## API Documentation

### Security Endpoints
- `GET /docs/security` - Security guidelines
- `GET /docs/security/status` - Security status
- `GET /docs/security/endpoint/*` - Endpoint-specific security

### Best Practices
1. Always use HTTPS in production
2. Include API version in requests
3. Handle rate limiting gracefully
4. Validate all input data
5. Use proper error handling
6. Implement request timeouts
7. Cache responses appropriately
8. Monitor API usage patterns

## Environment Configuration

### Required Variables
```env
JWT_SECRET=your-super-secret-jwt-key
SESSION_SECRET=your-session-secret
CORS_ORIGIN=https://yourdomain.com
```

### Security Settings
```env
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ENABLE_SECURITY_LOGGING=true
ENABLE_AUDIT_LOGGING=true
```

## Production Deployment

### Security Checklist
- [ ] HTTPS enabled with valid SSL certificate
- [ ] Environment variables properly configured
- [ ] Rate limiting configured for production load
- [ ] CORS origins restricted to production domains
- [ ] Security headers properly configured
- [ ] Monitoring and alerting enabled
- [ ] Regular security audits scheduled

### Monitoring
- Security event logging
- Performance monitoring
- Error tracking
- Audit trail maintenance

## Incident Response

### Security Events
1. **Detection**: Automated monitoring identifies threats
2. **Alert**: Security team notified immediately
3. **Response**: Immediate threat mitigation
4. **Analysis**: Root cause investigation
5. **Recovery**: System restoration and hardening

### Contact Information
- Security Team: security@householdplanetkenya.co.ke
- Emergency: +254-XXX-XXXX-XXX

## Compliance

### Standards
- OWASP Top 10 compliance
- Data protection regulations
- Industry security best practices

### Regular Audits
- Monthly security reviews
- Quarterly penetration testing
- Annual compliance assessments