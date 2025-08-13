# Household Planet Kenya - Authentication System

## Overview
Complete JWT-based authentication system with comprehensive security features for the Household Planet Kenya e-commerce platform.

## Features Implemented

### 🔐 Core Authentication
- **User Registration** with email verification
- **Login/Logout** with JWT tokens
- **Password Reset** with secure tokens
- **Refresh Token** mechanism
- **Strong Password** validation

### 👥 User Roles & Permissions
- **SUPER_ADMIN**: Full system access
- **ADMIN**: Administrative functions
- **STAFF**: Staff-level operations
- **CUSTOMER**: Standard user access
- **GUEST**: Limited access

### 📱 Phone Verification
- SMS verification using Africa's Talking (prepared)
- Phone number validation for Kenya (+254)
- Verification code generation and validation

### 🏠 Profile Management
- Complete user profile with avatar, DOB, gender
- Multiple address management (HOME, WORK, BILLING, SHIPPING, OTHER)
- Address CRUD operations with default address support

### 🔒 Security Guards & Decorators
- **JwtAuthGuard**: JWT token validation
- **RolesGuard**: Role-based access control
- **EmailVerifiedGuard**: Email verification requirement
- **ActiveUserGuard**: Active account validation
- **@Public()**: Bypass authentication
- **@Roles()**: Role-based endpoint protection

### 🌐 Social Login (Prepared)
- Google, Facebook, Apple integration ready
- Social provider data storage
- Automatic account linking

## API Endpoints

### Authentication Endpoints
```
POST /auth/register              - User registration
POST /auth/login                 - User login
GET  /auth/verify-email/:token   - Email verification
POST /auth/resend-verification   - Resend email verification
POST /auth/forgot-password       - Request password reset
POST /auth/reset-password        - Reset password with token
POST /auth/refresh               - Refresh access token
POST /auth/change-password       - Change password (authenticated)
POST /auth/logout                - User logout
GET  /auth/profile               - Get user profile
```

### Phone Verification
```
POST /auth/send-phone-verification - Send SMS verification code
POST /auth/verify-phone            - Verify phone with code
```

### Social Authentication
```
POST /auth/social-login - Social media login (Google/Facebook/Apple)
```

### User Profile Management
```
GET    /users/profile        - Get user profile
PATCH  /users/profile        - Update user profile
GET    /users/addresses      - Get user addresses
POST   /users/addresses      - Add new address
PATCH  /users/addresses/:id  - Update address
DELETE /users/addresses/:id  - Delete address
```

### Admin Endpoints
```
GET   /users/admin/all           - Get all users (ADMIN+)
PATCH /users/admin/:id/role      - Update user role (SUPER_ADMIN)
PATCH /users/admin/:id/status    - Toggle user status (ADMIN+)
```

## Security Features

### Password Security
- Minimum 8 characters
- Must contain: uppercase, lowercase, number, special character
- bcryptjs hashing with salt rounds: 12
- Password change requires current password verification

### Token Security
- JWT access tokens (1 hour expiry)
- Refresh tokens (7 days expiry)
- Secure token generation for email/phone verification
- Password reset tokens (1 hour expiry)

### Account Security
- Email verification required for sensitive operations
- Phone verification for enhanced security
- Account deactivation capability
- Last login tracking
- Failed login attempt monitoring (ready for implementation)

## Database Schema

### User Model
```typescript
{
  id: string (CUID)
  email: string (unique)
  phone?: string
  name: string
  role: string (default: "CUSTOMER")
  password: string (hashed)
  emailVerified: boolean
  phoneVerified: boolean
  emailVerifyToken?: string
  phoneVerifyToken?: string
  resetPasswordToken?: string
  resetPasswordExpires?: DateTime
  refreshToken?: string
  lastLoginAt?: DateTime
  isActive: boolean
  avatar?: string
  dateOfBirth?: DateTime
  gender?: string
  socialProviders?: string (JSON)
  twoFactorEnabled: boolean
  twoFactorSecret?: string
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Address Model
```typescript
{
  id: string (CUID)
  userId: string
  type: string (HOME/WORK/BILLING/SHIPPING/OTHER)
  fullName: string
  phone: string
  county: string
  town: string
  street: string
  landmark?: string
  isDefault: boolean
  createdAt: DateTime
  updatedAt: DateTime
}
```

## Usage Examples

### Registration
```typescript
POST /auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+254712345678",
  "password": "SecurePass123!",
  "dateOfBirth": "1990-01-01",
  "gender": "male"
}
```

### Login
```typescript
POST /auth/login
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

### Add Address
```typescript
POST /users/addresses
{
  "type": "HOME",
  "fullName": "John Doe",
  "phone": "+254712345678",
  "county": "Nairobi",
  "town": "Nairobi",
  "street": "123 Main Street",
  "landmark": "Near City Mall",
  "isDefault": true
}
```

### Role-Based Access
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Get('admin/users')
getUsers() {
  // Only accessible by ADMIN or SUPER_ADMIN
}
```

## Environment Variables
```env
JWT_SECRET=your-super-secret-jwt-key
DATABASE_URL=file:./dev.db
```

## Next Steps for Production

1. **Email Service Integration**
   - Configure SMTP or email service (SendGrid, AWS SES)
   - Implement email templates for verification and reset

2. **SMS Service Integration**
   - Integrate Africa's Talking SMS API
   - Configure SMS templates and rate limiting

3. **Social Login Implementation**
   - Configure OAuth providers (Google, Facebook, Apple)
   - Implement token verification for each provider

4. **Security Enhancements**
   - Rate limiting for authentication endpoints
   - Account lockout after failed attempts
   - Two-factor authentication (2FA)
   - Session management

5. **Monitoring & Logging**
   - Authentication event logging
   - Failed login attempt monitoring
   - Security audit trails

## Testing
The system is ready for testing with all endpoints functional. Use tools like Postman or Thunder Client to test the API endpoints.

## Database Migration
Run the following command to apply the database schema:
```bash
npx prisma migrate dev --name enhanced_auth_system
```