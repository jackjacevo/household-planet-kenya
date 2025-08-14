# File Upload Security & API Security Implementation

## Overview
This implementation provides comprehensive file upload security and API security features for the Household Planet Kenya e-commerce platform.

## File Upload Security Features

### 1. File Type Validation and Restriction
- **MIME Type Detection**: Uses `file-type` library to detect actual file types
- **Allowed File Types**: 
  - Images: JPEG, PNG, WebP, GIF
  - Documents: PDF, Plain Text
- **Malicious Content Detection**: Scans filenames for potentially dangerous extensions
- **File Size Limits**: 
  - General files: 10MB maximum
  - Images: 5MB maximum

### 2. Virus Scanning for Uploaded Files
- **ClamAV Integration**: Optional virus scanning with ClamAV
- **Pattern-based Scanning**: Basic suspicious content detection
- **Quarantine System**: Infected files are moved to quarantine directory
- **Fail-secure Approach**: Files are rejected if scanning fails

### 3. File Size Limits and Storage Quotas
- **Per-file Limits**: Configurable maximum file sizes
- **User Quotas**: 100MB storage limit per user (configurable)
- **File Count Limits**: Maximum 100 files per user
- **Automatic Cleanup**: Temporary files cleaned up after 24 hours

### 4. Secure File Storage with Access Controls
- **Secure Filenames**: Generated using SHA-256 hash
- **Directory Structure**: Organized by user ID and category
- **File Permissions**: Restricted file system permissions (644)
- **Access Logging**: All file access attempts are logged

### 5. Image Optimization and Resizing
- **Sharp Integration**: High-performance image processing
- **Multiple Sizes**: Automatic generation of thumbnails and different sizes
- **Format Conversion**: Automatic WebP conversion for better compression
- **Metadata Stripping**: Removes EXIF data for privacy

### 6. CDN Integration for Secure File Delivery
- **Secure URLs**: Generated with access tokens
- **Access Control**: User-based file access restrictions
- **Logging**: Comprehensive access logging for security monitoring

## API Security Features

### 1. API Authentication and Authorization
- **JWT-based Authentication**: Secure token-based authentication
- **Role-based Access Control**: User, Admin, Super Admin roles
- **Token Expiration**: Configurable token lifetimes
- **Refresh Token Support**: Extended session management

### 2. Request/Response Logging for Security Monitoring
- **Comprehensive Logging**: All API requests and responses logged
- **Security Event Logging**: Separate logging for security events
- **Structured Logging**: JSON format with Winston
- **Log Rotation**: Daily log rotation with retention policies

### 3. API Versioning and Deprecation Handling
- **Version Detection**: Header and URL-based version detection
- **Backward Compatibility**: Automatic response transformation
- **Deprecation Headers**: Proper deprecation notifications
- **Migration Support**: Smooth transition between API versions

### 4. CORS Configuration for Secure Cross-Origin Requests
- **Dynamic Origin Validation**: Environment-based allowed origins
- **Security Headers**: Comprehensive security header implementation
- **Preflight Handling**: Proper CORS preflight request handling
- **Credential Support**: Secure cookie and credential handling

### 5. API Documentation with Security Guidelines
- **Security Best Practices**: Comprehensive security documentation
- **Endpoint Documentation**: Detailed API endpoint documentation
- **Rate Limiting Info**: Rate limiting guidelines and headers
- **Error Handling**: Standardized error response format

## Implementation Details

### File Upload Module Structure
```
src/file-upload/
├── file-upload.module.ts          # Main module configuration
├── file-upload.service.ts         # Core upload service
├── file-upload.controller.ts      # Upload endpoints
├── file-validation.service.ts     # File validation logic
├── file-storage.service.ts        # Secure storage management
├── virus-scan.service.ts          # Virus scanning functionality
└── image-optimization.service.ts  # Image processing
```

### API Security Module Structure
```
src/api-security/
├── api-security.module.ts         # Main module configuration
├── api-security.controller.ts     # Security endpoints
├── api-logging.service.ts         # Request/response logging
├── api-versioning.service.ts      # Version management
├── cors-config.service.ts         # CORS configuration
├── api-documentation.service.ts   # Documentation service
└── interceptors/
    ├── api-logging.interceptor.ts     # Logging interceptor
    └── api-versioning.interceptor.ts  # Versioning interceptor
```

### Database Schema
New tables added to support file upload security and API logging:
- `UploadedFile`: File metadata and security information
- `FileAccessLog`: File access audit trail
- `ApiRequestLog`: API request logging
- `SecurityEvent`: Security event tracking

## API Endpoints

### File Upload Endpoints
- `POST /api/files/upload` - Upload single file
- `POST /api/files/upload-multiple` - Upload multiple files (max 5)
- `GET /api/files` - List user files
- `GET /api/files/:id` - Get file details
- `DELETE /api/files/:id` - Delete file

### API Security Endpoints
- `GET /api/api-security/version-info` - API version information
- `GET /api/api-security/documentation` - Security documentation
- `GET /api/api-security/cors-config` - CORS configuration (Admin only)
- `GET /api/api-security/health` - API health status

## Security Headers
The following security headers are automatically added to all responses:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), microphone=(), camera=()`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`

## Rate Limiting
Different rate limits applied based on endpoint sensitivity:
- Authentication: 5 requests per minute
- File Upload: 10 requests per minute
- File Upload Multiple: 5 requests per minute
- General API: 100 requests per minute

## Environment Configuration
```env
# File Upload Security
UPLOAD_PATH="./uploads"
MAX_FILE_SIZE=10485760
MAX_FILES_PER_USER=100
CLAMAV_ENABLED=false
ALLOWED_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"

# API Security
API_VERSION="v2"
LOG_LEVEL="info"
LOG_RETENTION_DAYS=30
SECURITY_LOG_RETENTION_DAYS=90
```

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install --save multer sharp file-type mime-types winston winston-daily-rotate-file express-slow-down
   ```

2. **Run Setup Script**:
   ```bash
   setup-file-api-security.bat
   ```

3. **Update Environment Variables**:
   - Configure upload paths and limits
   - Set allowed origins for CORS
   - Configure logging preferences

4. **Test Implementation**:
   ```bash
   node test-file-api-security.js
   ```

## Security Best Practices Implemented

1. **Input Validation**: All file uploads validated for type, size, and content
2. **Access Control**: User-based file access restrictions
3. **Audit Logging**: Comprehensive logging of all security events
4. **Fail-secure Design**: System fails securely when validation fails
5. **Rate Limiting**: Prevents abuse and DoS attacks
6. **CORS Protection**: Prevents unauthorized cross-origin requests
7. **Security Headers**: Comprehensive security header implementation
8. **Token-based Authentication**: Secure JWT-based authentication
9. **Version Management**: Proper API versioning with deprecation support
10. **Error Handling**: Secure error responses without information leakage

## Monitoring and Alerting

### Log Files
- `logs/api-YYYY-MM-DD.log` - General API request logs
- `logs/security-YYYY-MM-DD.log` - Security event logs

### Security Events Logged
- Failed authentication attempts
- Rate limit violations
- Suspicious file uploads
- Unauthorized access attempts
- API version deprecation warnings

## Performance Considerations

1. **Image Optimization**: Automatic WebP conversion reduces bandwidth
2. **Lazy Loading**: Images optimized for lazy loading
3. **CDN Ready**: File URLs compatible with CDN integration
4. **Efficient Logging**: Asynchronous logging to prevent performance impact
5. **Memory Management**: Proper cleanup of temporary files

## Compliance and Standards

- **OWASP Guidelines**: Follows OWASP security best practices
- **GDPR Compliance**: Metadata stripping for privacy protection
- **Industry Standards**: Implements standard security headers and practices
- **Audit Trail**: Comprehensive logging for compliance requirements

## Future Enhancements

1. **AWS S3 Integration**: Cloud storage for scalability
2. **Advanced Virus Scanning**: Integration with cloud-based scanning services
3. **Machine Learning**: AI-based content analysis for enhanced security
4. **Real-time Monitoring**: Integration with monitoring services
5. **Automated Threat Response**: Automatic blocking of suspicious activities

This implementation provides enterprise-grade file upload security and API security features, ensuring the platform meets modern security standards and compliance requirements.