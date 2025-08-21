# Admin Account Credentials

## Default Admin Account

**Email:** `admin@householdplanet.co.ke`  
**Password:** `HouseholdAdmin2024!`

## Setup Instructions

1. **Create Admin User:**
   ```bash
   cd household-planet-backend
   node create-admin.js
   ```

2. **Login to Admin Panel:**
   - Go to: http://localhost:3000/login
   - Use the credentials above
   - After login, you'll see "Admin Dashboard" in the profile dropdown

3. **Access Admin Features:**
   - Product management: `/admin/products`
   - Category management: `/admin/categories`
   - Order management: `/admin/orders`
   - Customer management: `/admin/customers`
   - Content management: `/admin/content`

## Security Notes

⚠️ **IMPORTANT:** Change the default password after first login!

- The admin account has full access to all system features
- Can upload and manage products
- Can manage customer orders and data
- Can configure site content and settings

## Admin Capabilities

✅ **Product Management**
- Upload product images
- Create/edit/delete products
- Manage inventory
- Set pricing and discounts

✅ **Content Management**
- Update homepage banners
- Manage categories
- Edit site content

✅ **Order Management**
- View all customer orders
- Update order status
- Process refunds

✅ **Customer Management**
- View customer accounts
- Manage customer support

## First Login Checklist

1. ✅ Login with default credentials
2. ✅ Verify admin dashboard access
3. ✅ Change default password
4. ✅ Test product upload functionality
5. ✅ Configure initial site content