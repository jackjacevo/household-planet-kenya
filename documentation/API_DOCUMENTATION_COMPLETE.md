# Household Planet Kenya - Complete API Documentation

## Base URL
- **Production**: `https://api.householdplanet.co.ke`
- **Development**: `http://localhost:3001`

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Error Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Authentication Endpoints

### POST /api/auth/register
Register new customer account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "+254700000000",
  "address": "Nairobi, Kenya"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "CUSTOMER"
    },
    "token": "jwt_token_here"
  }
}
```

### POST /api/auth/login
User login.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

### POST /api/auth/forgot-password
Request password reset.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

---

## Product Endpoints

### GET /api/products
Get products with pagination and filters.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `category` (string): Filter by category slug
- `search` (string): Search in product names/descriptions
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `inStock` (boolean): Filter by stock availability

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "name": "Non-Stick Cooking Pan",
        "description": "Premium quality cooking pan",
        "price": 2500,
        "images": ["image1.jpg"],
        "category": {
          "id": 1,
          "name": "Kitchen & Dining",
          "slug": "kitchen-dining"
        },
        "inStock": true,
        "stockQuantity": 50
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

### GET /api/products/:id
Get single product details.

### POST /api/products (Admin Only)
Create new product.

**Request Body:**
```json
{
  "name": "Product Name",
  "description": "Product description",
  "price": 2500,
  "categoryId": 1,
  "images": ["image1.jpg"],
  "stockQuantity": 100,
  "specifications": {
    "weight": "2kg",
    "dimensions": "30x20x10cm"
  }
}
```

---

## Category Endpoints

### GET /api/categories
Get all product categories.

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Kitchen & Dining",
        "slug": "kitchen-dining",
        "description": "Kitchen essentials and dining items",
        "productCount": 45
      }
    ]
  }
}
```

---

## Cart Endpoints

### GET /api/cart
Get user's cart items (Protected).

### POST /api/cart/add
Add item to cart (Protected).

**Request Body:**
```json
{
  "productId": 1,
  "quantity": 2
}
```

### PUT /api/cart/update/:itemId
Update cart item quantity (Protected).

### DELETE /api/cart/remove/:itemId
Remove item from cart (Protected).

### DELETE /api/cart/clear
Clear entire cart (Protected).

---

## Order Endpoints

### POST /api/orders
Create new order (Protected).

**Request Body:**
```json
{
  "deliveryAddress": "123 Main St, Nairobi",
  "deliveryLocation": "Nairobi CBD",
  "paymentMethod": "mpesa",
  "phone": "+254700000000",
  "notes": "Leave at gate"
}
```

### GET /api/orders
Get user's orders (Protected).

### GET /api/orders/:id
Get specific order details (Protected).

### PUT /api/orders/:id/cancel
Cancel order (Protected).

---

## Payment Endpoints

### POST /api/payments/mpesa/stk-push
Initiate M-Pesa STK Push payment.

**Request Body:**
```json
{
  "orderId": 123,
  "phoneNumber": "+254700000000",
  "amount": 2500
}
```

### POST /api/payments/mpesa/callback
M-Pesa callback endpoint (Internal).

### GET /api/payments/status/:transactionId
Check payment status.

---

## Delivery Endpoints

### POST /api/delivery/calculate
Calculate delivery fee and time.

**Request Body:**
```json
{
  "destination": "Nairobi CBD",
  "weight": 2.5,
  "items": 3
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "fee": 200,
    "estimatedDays": 1,
    "location": "Nairobi CBD"
  }
}
```

### GET /api/delivery/locations
Get available delivery locations.

---

## Admin Endpoints

### GET /api/admin/dashboard
Get admin dashboard metrics (Admin Only).

### GET /api/admin/orders
Get all orders with filters (Admin Only).

### PUT /api/admin/orders/:id/status
Update order status (Admin Only).

**Request Body:**
```json
{
  "status": "processing",
  "notes": "Order being prepared"
}
```

### GET /api/admin/customers
Get customer list (Admin Only).

### GET /api/admin/analytics/sales
Get sales analytics (Admin Only).

---

## File Upload Endpoints

### POST /api/upload/image
Upload product image (Admin Only).

**Request:** Multipart form data with image file.

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://cloudinary.com/image.jpg",
    "publicId": "image_id"
  }
}
```

---

## Notification Endpoints

### POST /api/notifications/email
Send email notification (Internal).

### POST /api/notifications/sms
Send SMS notification (Internal).

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Rate Limited
- `500` - Internal Server Error

## Rate Limits

- **General API**: 100 requests per minute per IP
- **Authentication**: 5 requests per minute per IP
- **Payment**: 10 requests per minute per IP

## Webhooks

### M-Pesa Callback
**URL**: `/api/payments/mpesa/callback`
**Method**: POST
**Headers**: `Content-Type: application/json`

### Order Status Updates
**URL**: `/api/webhooks/order-status`
**Method**: POST
**Authentication**: Webhook signature verification

## SDK Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'https://api.householdplanet.co.ke',
  headers: {
    'Authorization': 'Bearer ' + token
  }
});

// Get products
const products = await api.get('/api/products?category=kitchen-dining');

// Add to cart
await api.post('/api/cart/add', {
  productId: 1,
  quantity: 2
});
```

### cURL Examples
```bash
# Get products
curl -X GET "https://api.householdplanet.co.ke/api/products?limit=10" \
  -H "Content-Type: application/json"

# Login
curl -X POST "https://api.householdplanet.co.ke/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Create order
curl -X POST "https://api.householdplanet.co.ke/api/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"deliveryAddress":"Nairobi","paymentMethod":"mpesa"}'
```

## Testing

### Test Credentials
- **Admin**: admin@householdplanet.co.ke / Admin123!@#
- **Customer**: test@example.com / Test123!@#

### Test Payment
- **M-Pesa Test Number**: +254700000000
- **Test Amount**: Any amount ending in 00 (e.g., 100, 200)

### Postman Collection
Import the API collection: `https://api.householdplanet.co.ke/docs/postman.json`