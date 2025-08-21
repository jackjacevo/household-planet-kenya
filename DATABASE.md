# Database Schema Documentation

## Overview

The Household Planet Kenya e-commerce platform uses PostgreSQL with Prisma ORM for robust data management. The schema is designed to handle a complete e-commerce workflow with proper relationships and indexes.

## Database Tables

### Users
- **Purpose**: User accounts and authentication
- **Key Fields**: id, email, phone, name, role, password, emailVerified
- **Relationships**: One-to-many with orders, addresses, cart, wishlist, reviews
- **Indexes**: Unique on email

### Categories
- **Purpose**: Product categorization with hierarchical structure
- **Key Fields**: id, name, slug, description, image, parentId, isActive, sortOrder
- **Relationships**: Self-referencing for hierarchy, one-to-many with products
- **Indexes**: slug, parentId

### Brands
- **Purpose**: Product brand management
- **Key Fields**: id, name, slug, logo, isActive
- **Relationships**: One-to-many with products
- **Indexes**: Unique on slug

### Products
- **Purpose**: Main product catalog
- **Key Fields**: id, name, slug, description, sku, price, comparePrice, weight, dimensions, images, categoryId, brandId, isActive, isFeatured, seoTitle, seoDescription, tags
- **Relationships**: Many-to-one with category and brand, one-to-many with variants, orderItems, cart, wishlist, reviews
- **Indexes**: slug, categoryId, brandId, isActive, isFeatured

### ProductVariants
- **Purpose**: Product variations (size, color, etc.)
- **Key Fields**: id, productId, name, sku, price, stock, attributes (JSON)
- **Relationships**: Many-to-one with product, one-to-many with orderItems, cart
- **Indexes**: productId, unique on sku

### Orders
- **Purpose**: Customer orders
- **Key Fields**: id, userId, orderNumber, status, subtotal, shippingCost, total, shippingAddress (JSON), deliveryLocation, deliveryPrice, paymentMethod, paymentStatus
- **Relationships**: Many-to-one with user, one-to-many with orderItems
- **Indexes**: userId, orderNumber, status

### OrderItems
- **Purpose**: Individual order line items
- **Key Fields**: id, orderId, productId, variantId, quantity, price, total
- **Relationships**: Many-to-one with order, product, and variant
- **Indexes**: orderId

### Addresses
- **Purpose**: User shipping addresses
- **Key Fields**: id, userId, type, fullName, phone, county, town, street, isDefault
- **Relationships**: Many-to-one with user
- **Indexes**: userId

### Cart
- **Purpose**: Shopping cart items
- **Key Fields**: id, userId, productId, variantId, quantity
- **Relationships**: Many-to-one with user, product, and variant
- **Indexes**: userId, unique constraint on (userId, productId, variantId)

### Wishlist
- **Purpose**: User wishlists
- **Key Fields**: id, userId, productId
- **Relationships**: Many-to-one with user and product
- **Indexes**: userId, unique constraint on (userId, productId)

### Reviews
- **Purpose**: Product reviews and ratings
- **Key Fields**: id, productId, userId, rating, title, comment, isVerified
- **Relationships**: Many-to-one with product and user
- **Indexes**: productId, rating, unique constraint on (productId, userId)

## Enums

### Role
- CUSTOMER
- ADMIN
- SUPER_ADMIN

### OrderStatus
- PENDING
- CONFIRMED
- PROCESSING
- SHIPPED
- DELIVERED
- CANCELLED
- REFUNDED

### PaymentMethod
- CASH_ON_DELIVERY
- MPESA
- CARD
- BANK_TRANSFER

### PaymentStatus
- PENDING
- PAID
- FAILED
- REFUNDED

### AddressType
- HOME
- OFFICE
- OTHER

## Key Features

### Data Integrity
- Foreign key constraints ensure referential integrity
- Unique constraints prevent duplicate data
- Cascade deletes maintain consistency

### Performance Optimization
- Strategic indexes on frequently queried fields
- Composite indexes for complex queries
- Proper data types for optimal storage

### Scalability
- Hierarchical categories support unlimited nesting
- JSON fields for flexible attribute storage
- Decimal precision for accurate pricing

### Security
- Password hashing with bcrypt
- Role-based access control
- Email verification tracking

## Setup Instructions

1. **Start Database**:
   ```bash
   npm run db:start
   ```

2. **Run Migrations**:
   ```bash
   npm run db:migrate
   ```

3. **Seed Initial Data**:
   ```bash
   npm run db:seed
   ```

4. **Access Database**:
   - Prisma Studio: `npm run db:studio`
   - Adminer: `http://localhost:8080`

## Migration Commands

- `npm run prisma:migrate` - Create and apply new migration
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:studio` - Open visual database browser
- `npm run prisma:seed` - Run seed script