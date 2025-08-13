# Household Planet Kenya - API Documentation

## Base URL
```
http://localhost:3000
```

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
  "error": null
}
```

## Error Responses
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {}
  }
}
```

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!",
  "name": "John Doe",
  "phone": "+254712345678"
}
```

### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!",
  "guestCartItems": [
    {
      "productId": "prod_123",
      "variantId": "var_456",
      "quantity": 2
    }
  ]
}
```

### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_token_here"
}
```

---

## 📂 Categories Endpoints

### Get All Categories
```http
GET /categories
```

### Get Category by ID
```http
GET /categories/{categoryId}
```

### Create Category (Admin)
```http
POST /categories
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Kitchen & Dining",
  "slug": "kitchen-dining",
  "description": "Kitchen and dining essentials",
  "parentId": null
}
```

---

## 🛍️ Products Endpoints

### Get All Products
```http
GET /products?page=1&limit=10&categoryId=cat_123&minPrice=100&maxPrice=5000&inStock=true&sortBy=price&sortOrder=asc
```

### Search Products
```http
GET /products/search?q=kitchen&category=cat_123&minPrice=100&maxPrice=5000
```

### Get Product by ID
```http
GET /products/{productId}
```

### Create Product (Admin)
```http
POST /products
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Kitchen Utensil Set",
  "description": "Complete kitchen utensil set",
  "price": 2500,
  "categoryId": "cat_123",
  "sku": "KIT-001",
  "stock": 50,
  "images": ["image1.jpg", "image2.jpg"],
  "variants": [
    {
      "name": "Small Set",
      "sku": "KIT-001-S",
      "price": 2000,
      "stock": 20,
      "size": "Small"
    }
  ]
}
```

### Bulk Import Products (Admin)
```http
POST /products/bulk-import
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "products": [
    {
      "name": "Product 1",
      "price": 1500,
      "categoryId": "cat_123",
      "sku": "PROD-001",
      "stock": 25
    }
  ]
}
```

### Get Product Recommendations
```http
GET /products/{productId}/recommendations
```

### Update Product Stock (Admin)
```http
PUT /products/{productId}/stock
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "stock": 45
}
```

---

## 🛒 Cart Endpoints

### Add to Cart
```http
POST /cart
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "productId": "prod_123",
  "variantId": "var_456",
  "quantity": 2
}
```

### Get User Cart
```http
GET /cart
Authorization: Bearer <user_token>
```

### Update Cart Item
```http
PUT /cart/{cartItemId}
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "quantity": 3
}
```

### Remove Cart Item
```http
DELETE /cart/{cartItemId}
Authorization: Bearer <user_token>
```

### Clear Cart
```http
DELETE /cart
Authorization: Bearer <user_token>
```

### Save for Later
```http
POST /cart/{cartItemId}/save-for-later
Authorization: Bearer <user_token>
```

### Validate Guest Cart
```http
POST /guest-cart/validate
Content-Type: application/json

{
  "items": [
    {
      "productId": "prod_123",
      "quantity": 2
    }
  ]
}
```

---

## 📦 Orders Endpoints

### Create Order
```http
POST /orders
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "items": [
    {
      "productId": "prod_123",
      "variantId": "var_456",
      "quantity": 2
    }
  ],
  "shippingAddress": "123 Main St, Nairobi",
  "deliveryLocation": "Nairobi CBD",
  "deliveryPrice": 200,
  "paymentMethod": "MPESA"
}
```

### Create Order from Cart
```http
POST /orders/from-cart
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "shippingAddress": "123 Main St, Nairobi",
  "deliveryLocation": "Nairobi CBD",
  "deliveryPrice": 200,
  "paymentMethod": "MPESA"
}
```

### Get User Orders
```http
GET /orders?page=1&limit=10
Authorization: Bearer <user_token>
```

### Get Order Details
```http
GET /orders/{orderId}
Authorization: Bearer <user_token>
```

### Get Order Tracking
```http
GET /orders/{orderId}/tracking
Authorization: Bearer <user_token>
```

### Update Order Status (Admin)
```http
PUT /orders/{orderId}/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "CONFIRMED",
  "notes": "Order confirmed and payment verified"
}
```

### Create Return Request
```http
POST /orders/{orderId}/return
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "reason": "Product defective",
  "description": "Item arrived damaged",
  "items": [
    {
      "orderItemId": "item_123",
      "reason": "Defective",
      "condition": "Damaged"
    }
  ]
}
```

### Get Return Requests
```http
GET /orders/returns/my-requests
Authorization: Bearer <user_token>
```

---

## ⭐ Reviews Endpoints

### Get Product Reviews
```http
GET /products/{productId}/reviews?page=1&limit=10
```

### Add Product Review
```http
POST /products/{productId}/reviews
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "rating": 5,
  "title": "Excellent product!",
  "comment": "Great quality, highly recommended."
}
```

---

## 👤 User Endpoints

### Get User Profile
```http
GET /users/profile
Authorization: Bearer <user_token>
```

### Update User Profile
```http
PUT /users/profile
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "+254712345679"
}
```

### Get User Wishlist
```http
GET /users/wishlist
Authorization: Bearer <user_token>
```

### Add to Wishlist
```http
POST /users/wishlist
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "productId": "prod_123"
}
```

### Remove from Wishlist
```http
DELETE /users/wishlist/{productId}
Authorization: Bearer <user_token>
```

---

## 📊 Admin Endpoints

### Get Inventory Alerts
```http
GET /products/inventory/alerts
Authorization: Bearer <admin_token>
```

### Update Return Request Status
```http
PUT /orders/returns/{returnRequestId}/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "APPROVED",
  "notes": "Return approved, refund processing"
}
```

---

## 📋 Status Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 201  | Created |
| 400  | Bad Request |
| 401  | Unauthorized |
| 403  | Forbidden |
| 404  | Not Found |
| 409  | Conflict |
| 422  | Validation Error |
| 500  | Internal Server Error |

---

## 🔄 Order Status Values

- `PENDING` - Order created, awaiting confirmation
- `CONFIRMED` - Order confirmed, payment verified
- `PROCESSING` - Order being prepared
- `SHIPPED` - Order dispatched
- `DELIVERED` - Order delivered
- `CANCELLED` - Order cancelled
- `RETURNED` - Order returned

---

## 💳 Payment Methods

- `MPESA` - M-Pesa mobile payment
- `CARD` - Credit/Debit card
- `CASH` - Cash on delivery

---

## 📱 Response Examples

### Product List Response
```json
{
  "products": [
    {
      "id": "prod_123",
      "name": "Kitchen Utensil Set",
      "price": 2500,
      "images": ["image1.jpg"],
      "category": {
        "id": "cat_123",
        "name": "Kitchen & Dining"
      },
      "averageRating": 4.5,
      "totalReviews": 12
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

### Cart Response
```json
{
  "items": [
    {
      "id": "cart_123",
      "quantity": 2,
      "product": {
        "id": "prod_123",
        "name": "Kitchen Utensil Set",
        "price": 2500
      },
      "variant": {
        "id": "var_456",
        "name": "Small Set",
        "price": 2000
      }
    }
  ],
  "total": 4000,
  "itemCount": 2
}
```

### Order Response
```json
{
  "id": "order_123",
  "orderNumber": "ORD-2024-001",
  "status": "PENDING",
  "total": 4200,
  "items": [
    {
      "id": "item_123",
      "quantity": 2,
      "price": 2000,
      "total": 4000,
      "product": {
        "name": "Kitchen Utensil Set"
      }
    }
  ],
  "createdAt": "2024-01-15T10:30:00Z"
}
```