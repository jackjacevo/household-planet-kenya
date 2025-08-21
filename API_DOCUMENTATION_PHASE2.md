# Household Planet Kenya - Phase 2 API Documentation

## Overview
This document covers all Phase 2 APIs including product catalog, cart management, order processing, reviews, and inventory tracking.

## Base URL
```
http://localhost:3001
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Products API

### Get All Products
```http
GET /products
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search term
- `categoryId` (number): Filter by category
- `brandId` (number): Filter by brand
- `isFeatured` (boolean): Filter featured products
- `sortBy` (string): Sort field (default: createdAt)
- `sortOrder` (string): asc/desc (default: desc)
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `inStock` (boolean): Filter products in stock

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Non-Stick Frying Pan Set",
      "slug": "non-stick-frying-pan-set",
      "description": "Professional grade non-stick frying pan set",
      "price": 2500,
      "comparePrice": 3000,
      "images": ["/images/products/frying-pan-set.jpg"],
      "category": { "id": 1, "name": "Kitchen and Dining" },
      "brand": { "id": 5, "name": "Generic" },
      "variants": [...],
      "averageRating": 4.5,
      "reviewCount": 12,
      "totalStock": 25
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### Get Product by ID
```http
GET /products/:id
```

### Get Product by Slug
```http
GET /products/slug/:slug
```

### Search Products (Autocomplete)
```http
GET /products/search/autocomplete?q=search_term&limit=10
```

### Get Product Recommendations
```http
GET /products/:id/recommendations?type=RELATED&limit=6
```

**Types:** RELATED, FREQUENTLY_BOUGHT_TOGETHER, SIMILAR, TRENDING

### Create Product (Admin)
```http
POST /products
Authorization: Bearer <admin-token>
```

**Body:**
```json
{
  "name": "Product Name",
  "slug": "product-slug",
  "description": "Product description",
  "shortDescription": "Short description",
  "sku": "PROD001",
  "price": 1000,
  "comparePrice": 1200,
  "categoryId": 1,
  "brandId": 1,
  "images": ["/path/to/image.jpg"],
  "tags": ["tag1", "tag2"],
  "isFeatured": false
}
```

### Product Variants

#### Create Variant
```http
POST /products/:id/variants
Authorization: Bearer <admin-token>
```

**Body:**
```json
{
  "name": "Variant Name",
  "sku": "VAR001",
  "price": 1000,
  "stock": 50,
  "lowStockThreshold": 5,
  "size": "Large",
  "color": "Red",
  "material": "Cotton"
}
```

#### Get Product Variants
```http
GET /products/:id/variants
```

#### Update Variant
```http
PATCH /products/variants/:variantId
Authorization: Bearer <admin-token>
```

#### Delete Variant
```http
DELETE /products/variants/:variantId
Authorization: Bearer <admin-token>
```

### Bulk Operations

#### Bulk Create Products
```http
POST /products/bulk
Authorization: Bearer <admin-token>
```

#### Import from CSV
```http
POST /products/import/csv
Authorization: Bearer <admin-token>
Content-Type: multipart/form-data
```

#### Export to CSV
```http
GET /products/export/csv
Authorization: Bearer <admin-token>
```

### Recently Viewed
```http
GET /products/user/recently-viewed?limit=10
Authorization: Bearer <token>
```

### Low Stock Alerts (Admin)
```http
GET /products/admin/low-stock-alerts
Authorization: Bearer <admin-token>
```

---

## Categories API

### Get All Categories
```http
GET /categories
```

### Get Category by ID
```http
GET /categories/:id
```

### Create Category (Admin)
```http
POST /categories
Authorization: Bearer <admin-token>
```

**Body:**
```json
{
  "name": "Category Name",
  "slug": "category-slug",
  "description": "Category description",
  "parentId": null,
  "sortOrder": 1
}
```

---

## Cart API

### Get Cart
```http
GET /cart
Authorization: Bearer <token>
```

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "productId": 1,
      "variantId": 1,
      "quantity": 2,
      "product": {...},
      "variant": {...},
      "itemTotal": 5000
    }
  ],
  "summary": {
    "subtotal": 5000,
    "totalItems": 2,
    "estimatedShipping": 0,
    "total": 5000
  }
}
```

### Add to Cart
```http
POST /cart
Authorization: Bearer <token>
```

**Body:**
```json
{
  "productId": 1,
  "variantId": 1,
  "quantity": 2
}
```

### Update Cart Item
```http
PUT /cart/:id
Authorization: Bearer <token>
```

**Body:**
```json
{
  "quantity": 3
}
```

### Remove from Cart
```http
DELETE /cart/:id
Authorization: Bearer <token>
```

### Clear Cart
```http
DELETE /cart
Authorization: Bearer <token>
```

### Save for Later
```http
POST /cart/save-for-later/:id
Authorization: Bearer <token>
```

### Get Cart Summary
```http
GET /cart/summary
Authorization: Bearer <token>
```

### Validate Cart
```http
POST /cart/validate
Authorization: Bearer <token>
```

---

## Orders API

### Create Order
```http
POST /orders
Authorization: Bearer <token>
```

**Body:**
```json
{
  "items": [
    {
      "productId": 1,
      "variantId": 1,
      "quantity": 2,
      "price": 2500
    }
  ],
  "shippingAddress": {
    "fullName": "John Doe",
    "phone": "+254700000000",
    "county": "Nairobi",
    "town": "Nairobi",
    "street": "123 Main St"
  },
  "deliveryLocation": "Nairobi CBD",
  "deliveryPrice": 200,
  "paymentMethod": "MPESA"
}
```

### Get My Orders
```http
GET /orders/my-orders
Authorization: Bearer <token>
```

### Get Order by ID
```http
GET /orders/:id
Authorization: Bearer <token>
```

### Track Order
```http
GET /orders/track/:orderNumber
```

**Response:**
```json
{
  "order": {
    "id": 1,
    "orderNumber": "HP-1234567890",
    "status": "PROCESSING",
    "total": 5200,
    "createdAt": "2024-01-15T10:00:00Z"
  },
  "statusHistory": [
    {
      "status": "PENDING",
      "date": "2024-01-15T10:00:00Z",
      "completed": true,
      "description": "Order placed successfully"
    },
    {
      "status": "CONFIRMED",
      "date": "2024-01-15T11:00:00Z",
      "completed": true,
      "description": "Order confirmed and being prepared"
    }
  ]
}
```

### Update Order Status (Admin)
```http
PUT /orders/:id/status
Authorization: Bearer <admin-token>
```

**Body:**
```json
{
  "status": "SHIPPED"
}
```

### Create Return
```http
POST /orders/returns
Authorization: Bearer <token>
```

**Body:**
```json
{
  "orderId": 1,
  "reason": "Defective product",
  "description": "Product arrived damaged"
}
```

### Admin Analytics

#### Order Statistics
```http
GET /orders/admin/stats
Authorization: Bearer <admin-token>
```

#### Inventory Report
```http
GET /orders/admin/inventory-report
Authorization: Bearer <admin-token>
```

#### Sales Report
```http
GET /orders/admin/sales-report?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <admin-token>
```

---

## Reviews API

### Create Review
```http
POST /reviews
Authorization: Bearer <token>
```

**Body:**
```json
{
  "productId": 1,
  "rating": 5,
  "title": "Great product!",
  "comment": "Really satisfied with this purchase."
}
```

### Get All Reviews
```http
GET /reviews?page=1&limit=10&productId=1&rating=5
```

### Get Product Reviews
```http
GET /reviews/product/:productId?page=1&limit=10
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "rating": 5,
      "title": "Great product!",
      "comment": "Really satisfied with this purchase.",
      "isVerified": true,
      "createdAt": "2024-01-15T10:00:00Z",
      "user": {
        "name": "John Doe"
      }
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "averageRating": 4.2,
    "ratingDistribution": [
      { "rating": 5, "count": 15 },
      { "rating": 4, "count": 8 },
      { "rating": 3, "count": 2 },
      { "rating": 2, "count": 0 },
      { "rating": 1, "count": 0 }
    ]
  }
}
```

### Get Product Rating Stats
```http
GET /reviews/product/:productId/stats
```

### Update Review
```http
PATCH /reviews/:id
Authorization: Bearer <token>
```

### Delete Review
```http
DELETE /reviews/:id
Authorization: Bearer <token>
```

---

## Authentication API

### Register
```http
POST /auth/register
```

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+254700000000"
}
```

### Login
```http
POST /auth/login
```

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "jwt-token-here",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "CUSTOMER"
  }
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- General endpoints: 100 requests per minute
- Authentication endpoints: 10 requests per minute

---

## Pagination

List endpoints support pagination with these parameters:
- `page` - Page number (starts from 1)
- `limit` - Items per page (max 100)

Response includes pagination metadata in the `meta` object.

---

## Search and Filtering

### Product Search
Products can be searched using the `search` parameter which searches across:
- Product name
- Description
- Tags

### Advanced Filtering
Products support multiple filters:
- Category
- Brand
- Price range
- Stock availability
- Featured status

### Sorting
Products can be sorted by:
- `createdAt` (default)
- `price`
- `name`
- `rating`

---

## Inventory Management

### Stock Tracking
- Stock is automatically decremented when orders are placed
- Low stock alerts are generated when stock falls below threshold
- Out of stock products are automatically filtered from search results

### Bulk Operations
- CSV import/export for products
- Bulk product creation
- Inventory reports for admin users

---

## Recommendations Engine

The system includes a recommendation engine that suggests:
- Related products
- Frequently bought together items
- Similar products
- Trending products

Recommendations are generated based on:
- Purchase history
- Product categories
- User behavior
- Product attributes