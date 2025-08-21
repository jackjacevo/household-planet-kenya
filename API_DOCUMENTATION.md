# Household Planet Kenya - API Documentation

## Base URL
```
http://localhost:3001
```

## Authentication Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+254700000000"
}
```

**Response:**
```json
{
  "message": "Registration successful. Please verify your email.",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "role": "CUSTOMER",
    "emailVerified": false
  }
}
```

### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "role": "CUSTOMER"
  }
}
```

### Get Profile (Protected)
```http
GET /auth/profile
Authorization: Bearer <JWT_TOKEN>
```

### Forgot Password
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

### Reset Password
```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_here",
  "password": "newpassword123"
}
```

### Verify Email
```http
GET /auth/verify-email/:token
```

### Logout (Protected)
```http
POST /auth/logout
Authorization: Bearer <JWT_TOKEN>
```

## User Roles
- `GUEST` - Unauthenticated users
- `CUSTOMER` - Regular customers
- `STAFF` - Store staff members
- `ADMIN` - Store administrators
- `SUPER_ADMIN` - System administrators

## Products Endpoints

### Get All Products
```http
GET /products
```

### Get Product by ID
```http
GET /products/:id
```

### Create Product (Admin Only)
```http
POST /products
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Product description",
  "price": 1000,
  "categoryId": 1
}
```

## Orders Endpoints

### Get User Orders (Protected)
```http
GET /orders
Authorization: Bearer <JWT_TOKEN>
```

### Get Order by ID (Protected)
```http
GET /orders/:id
Authorization: Bearer <JWT_TOKEN>
```

### Create Order (Protected)
```http
POST /orders
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "fullName": "John Doe",
    "phone": "+254700000000",
    "county": "Nairobi",
    "town": "Nairobi",
    "street": "123 Main St"
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found"
}
```