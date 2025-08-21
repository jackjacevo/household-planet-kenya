# Complete JWT Authentication System - Household Planet Kenya

## Overview

A comprehensive JWT-based authentication system with advanced security features, user role management, and multi-factor authentication support.

## Features Implemented

### 🔐 Core Authentication
- **User Registration** with email verification
- **Secure Login/Logout** with session management
- **Password Reset** with secure tokens
- **JWT Token Management** with refresh tokens
- **Session Tracking** with device information

### 👥 User Role System
- **SUPER_ADMIN**: Full system access
- **ADMIN**: Administrative privileges
- **STAFF**: Staff-level access
- **CUSTOMER**: Standard customer access
- **GUEST**: Limited access

### 🛡️ Security Features
- **Account Locking** after failed login attempts
- **Password Strength** validation
- **Rate Limiting** on sensitive endpoints
- **IP Address & User Agent** tracking
- **Session Management** with device tracking
- **Security Logging** for all authentication events

### 📱 Multi-Factor Authentication
- **Email Verification** required for account activation
- **Phone Verification** via SMS (Africa's Talking ready)
- **2FA Support** preparation for future implementation

### 🌐 Social Login Preparation
- **Google OAuth** integration ready
- **Facebook Login** integration ready
- **Apple Sign-In** integration ready

## API Endpoints

### Authentication Endpoints

#### POST /auth/register
Register a new user account.
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+254712345678"
}
```

#### POST /auth/login
Authenticate user and receive tokens.
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "rememberMe": true
}
```

#### POST /auth/refresh
Refresh access token using refresh token.
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /auth/logout
Logout from current session.

#### POST /auth/logout-all
Logout from all active sessions.

#### POST /auth/verify-email
Verify email address with token.
```json
{
  "token": "verification-token-here"
}
```

#### POST /auth/forgot-password
Request password reset email.
```json
{
  "email": "user@example.com"
}
```

#### POST /auth/reset-password
Reset password with token.
```json
{
  "token": "reset-token-here",
  "password": "NewSecurePass123!"
}
```

#### POST /auth/change-password
Change password (authenticated users).
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewSecurePass123!"
}
```

#### POST /auth/send-phone-verification
Send SMS verification code.
```json
{
  "phone": "+254712345678"
}
```

#### POST /auth/verify-phone
Verify phone number with SMS code.
```json
{
  "phone": "+254712345678",
  "code": "123456"
}
```

#### GET /auth/profile
Get current user profile (authenticated).

#### GET /auth/sessions
List active user sessions (authenticated).

## Database Schema

### Enhanced User Model
```sql
- id: Primary key
- email: Unique email address
- phone: Phone number (optional)
- phoneVerified: Phone verification status
- name: Full name
- role: User role (SUPER_ADMIN, ADMIN, STAFF, CUSTOMER, GUEST)
- firstName, lastName: Name components
- password: Hashed password
- emailVerified: Email verification status
- resetToken, resetTokenExpiry: Password reset tokens
- verificationToken, verificationTokenExpiry: Email verification tokens
- refreshToken: Current refresh token
- socialProviders: Connected social accounts (JSON)
- googleId, facebookId, appleId: Social login IDs
- twoFactorEnabled: 2FA status
- twoFactorSecret: 2FA secret key
- backupCodes: 2FA backup codes (JSON)
- loginAttempts: Failed login counter
- lockedUntil: Account lock expiry
- permissions: User permissions (JSON)
- isActive: Account status
- lastLogin: Last login timestamp
```

### Session Management
```sql
UserSession:
- id: Session ID
- userId: User reference
- token: JWT access token
- refreshToken: Refresh token
- deviceInfo: Device information (JSON)
- ipAddress: Client IP
- userAgent: Browser/app info
- isActive: Session status
- expiresAt: Session expiry
- lastUsedAt: Last activity
```

### Security Tracking
```sql
LoginAttempt:
- email: Attempted email
- ipAddress: Client IP
- userAgent: Browser info
- success: Login result
- failureReason: Error details
- createdAt: Attempt timestamp

PasswordResetToken:
- userId: User reference
- token: Reset token
- expiresAt: Token expiry
- used: Usage status

EmailVerificationToken:
- userId: User reference
- token: Verification token
- expiresAt: Token expiry
- used: Usage status

PhoneVerificationToken:
- userId: User reference
- phone: Phone number
- token: SMS code
- expiresAt: Code expiry
- attempts: Verification attempts
- used: Usage status
```

## Security Features

### Password Security
- **Minimum 8 characters**
- **Uppercase & lowercase letters**
- **Numbers & special characters**
- **bcryptjs hashing** with salt rounds 12

### Account Protection
- **5 failed attempts** trigger account lock
- **30-minute lockout** period
- **Automatic unlock** after timeout
- **Login attempt logging**

### Token Security
- **15-minute access tokens**
- **7-day refresh tokens**
- **Session-based validation**
- **Automatic token rotation**

### Rate Limiting
- **Registration**: 3 per minute
- **Login**: 5 per minute
- **Password Reset**: 3 per 5 minutes
- **SMS Verification**: 3 per 5 minutes

## Guards & Decorators

### Authentication Guards
- `JwtAuthGuard`: Validates JWT tokens
- `RolesGuard`: Enforces role-based access
- `EmailVerifiedGuard`: Requires verified email
- `PhoneVerifiedGuard`: Requires verified phone

### Decorators
- `@Public()`: Skip authentication
- `@Roles(UserRole.ADMIN)`: Require specific roles
- `@RequirePermissions('manage_users')`: Fine-grained permissions
- `@CurrentUser()`: Inject current user data

## Usage Examples

### Protecting Routes
```typescript
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminController {
  
  @Get('users')
  @RequirePermissions('view_users')
  async getUsers(@CurrentUser() user: any) {
    // Only admins with 'view_users' permission can access
  }
  
  @Post('sensitive-action')
  @UseGuards(EmailVerifiedGuard, PhoneVerifiedGuard)
  async sensitiveAction(@CurrentUser() user: any) {
    // Requires both email and phone verification
  }
}
```

### Public Routes
```typescript
@Controller('public')
export class PublicController {
  
  @Get('products')
  @Public()
  async getProducts() {
    // No authentication required
  }
}
```

## Environment Variables

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=15m

# Database
DATABASE_URL=file:./prisma/dev.db

# SMS Service (Africa's Talking)
AFRICASTALKING_API_KEY=your-api-key
AFRICASTALKING_USERNAME=your-username
AFRICASTALKING_SENDER_ID=your-sender-id

# Social Login
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
APPLE_CLIENT_ID=your-apple-client-id
APPLE_PRIVATE_KEY=your-apple-private-key
```

## Testing

### Run Authentication Tests
```bash
npm run test auth.service.spec.ts
```

### Test Endpoints
```bash
# Register new user
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","firstName":"John","lastName":"Doe"}'

# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Access protected route
curl -X GET http://localhost:3001/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Future Enhancements

### Planned Features
- **Two-Factor Authentication** (TOTP/SMS)
- **Biometric Authentication** support
- **OAuth2 Server** implementation
- **Advanced Audit Logging**
- **Suspicious Activity Detection**
- **Geolocation-based Security**

### Integration Ready
- **Africa's Talking SMS** service
- **Google OAuth 2.0**
- **Facebook Login**
- **Apple Sign-In**
- **Email Service** (SendGrid/AWS SES)

## Security Best Practices

### Implemented
✅ Password hashing with bcryptjs  
✅ JWT token expiration  
✅ Rate limiting on sensitive endpoints  
✅ Account lockout mechanism  
✅ Secure token generation  
✅ Session management  
✅ Input validation  
✅ SQL injection prevention  
✅ XSS protection headers  

### Recommended
- Enable HTTPS in production
- Implement CSRF protection
- Add request logging
- Monitor for suspicious patterns
- Regular security audits
- Keep dependencies updated

## Deployment Notes

1. **Environment Setup**: Configure all environment variables
2. **Database Migration**: Run `npx prisma db push`
3. **SSL Certificate**: Enable HTTPS for production
4. **Rate Limiting**: Configure appropriate limits for your traffic
5. **Monitoring**: Set up logging and alerting
6. **Backup Strategy**: Regular database backups

## Support

For technical support or questions about the authentication system:
- Review the API documentation
- Check the test files for usage examples
- Refer to NestJS and Prisma documentation
- Contact the development team

---

**Status**: ✅ Complete and Production Ready  
**Last Updated**: December 2024  
**Version**: 1.0.0