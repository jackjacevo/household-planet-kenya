# Admin User Manual - Household Planet Kenya

## Table of Contents
1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Product Management](#product-management)
4. [Order Management](#order-management)
5. [Customer Management](#customer-management)
6. [Inventory Management](#inventory-management)
7. [Reports & Analytics](#reports--analytics)
8. [System Settings](#system-settings)

---

## Getting Started

### Accessing the Admin Panel
1. Navigate to: `https://householdplanet.co.ke/admin`
2. Enter your admin credentials
3. Click "Sign In"

**Default Admin Credentials:**
- Email: admin@householdplanet.co.ke
- Password: Admin123!@#

### First Login Setup
1. Change default password immediately
2. Set up two-factor authentication (recommended)
3. Complete your profile information
4. Review system settings

---

## Dashboard Overview

### Main Dashboard Elements

**📊 Key Metrics Cards**
- **Today's Sales**: Total revenue for current day
- **Orders**: Number of orders (pending/processing/completed)
- **Customers**: Total registered customers
- **Products**: Total products in catalog

**📈 Charts and Graphs**
- **Sales Chart**: 7-day sales trend
- **Order Status**: Pie chart of order statuses
- **Top Products**: Best-selling items
- **Customer Activity**: Recent registrations

**🔔 Alerts Panel**
- Low stock alerts
- Payment failures
- System notifications
- Customer support tickets

### Quick Actions
- Add New Product
- Process Orders
- View Reports
- System Health Check

---

## Product Management

### Adding New Products

1. **Navigate to Products**
   - Click "Products" in sidebar
   - Click "Add New Product" button

2. **Basic Information**
   - **Product Name**: Enter descriptive name
   - **Description**: Detailed product description
   - **Category**: Select from dropdown
   - **Price**: Enter price in KES (no commas)

3. **Images**
   - Click "Upload Images"
   - Select up to 5 high-quality images
   - First image becomes primary
   - Recommended size: 800x800px minimum

4. **Inventory**
   - **Stock Quantity**: Current available stock
   - **SKU**: Unique product identifier (auto-generated)
   - **Low Stock Alert**: Set minimum quantity threshold

5. **SEO Settings**
   - **Meta Title**: SEO-friendly title
   - **Meta Description**: Brief description for search engines
   - **URL Slug**: Custom URL (auto-generated from name)

6. **Save Product**
   - Click "Save Draft" to save without publishing
   - Click "Publish" to make live immediately

### Editing Products

1. Go to Products → All Products
2. Click product name or "Edit" button
3. Make necessary changes
4. Click "Update Product"

### Bulk Actions

1. Select multiple products using checkboxes
2. Choose action from "Bulk Actions" dropdown:
   - Delete selected
   - Change category
   - Update stock status
   - Export to CSV

### Product Categories

**Managing Categories:**
1. Go to Products → Categories
2. Click "Add New Category"
3. Fill in:
   - Category Name
   - Slug (URL-friendly name)
   - Description
   - Parent Category (if subcategory)
4. Click "Save Category"

---

## Order Management

### Order Status Workflow

**Order Statuses:**
- **Pending**: New order, payment pending
- **Paid**: Payment confirmed
- **Processing**: Order being prepared
- **Shipped**: Order dispatched
- **Delivered**: Order completed
- **Cancelled**: Order cancelled
- **Refunded**: Payment refunded

### Processing Orders

1. **View Orders**
   - Go to Orders → All Orders
   - Orders sorted by date (newest first)

2. **Order Details**
   - Click order number to view details
   - Review customer information
   - Check payment status
   - Verify delivery address

3. **Update Order Status**
   - Select new status from dropdown
   - Add internal notes (optional)
   - Click "Update Status"
   - Customer receives automatic notification

4. **Print Order**
   - Click "Print" button for packing slip
   - Includes customer details and items

### Payment Management

**Payment Status Indicators:**
- 🟢 **Paid**: Payment confirmed
- 🟡 **Pending**: Awaiting payment
- 🔴 **Failed**: Payment failed
- 🔵 **Refunded**: Payment refunded

**Processing Refunds:**
1. Open order details
2. Click "Refund" button
3. Enter refund amount
4. Select refund reason
5. Click "Process Refund"

### Shipping Management

1. **Generate Shipping Labels**
   - Select orders to ship
   - Click "Generate Labels"
   - Print labels for packages

2. **Track Shipments**
   - Enter tracking numbers
   - Update delivery status
   - Send tracking info to customers

---

## Customer Management

### Customer Overview

**Customer Information Panel:**
- Personal details (name, email, phone)
- Registration date
- Total orders and spending
- Last login date
- Account status

### Managing Customers

1. **View All Customers**
   - Go to Customers → All Customers
   - Search by name, email, or phone
   - Filter by registration date or status

2. **Customer Details**
   - Click customer name to view profile
   - See order history
   - View support tickets
   - Check payment methods

3. **Customer Actions**
   - **Edit Profile**: Update customer information
   - **Reset Password**: Send password reset email
   - **Suspend Account**: Temporarily disable account
   - **Delete Account**: Permanently remove (use carefully)

### Customer Support

**Support Tickets:**
1. Go to Customers → Support Tickets
2. View ticket details and conversation
3. Respond to customer inquiries
4. Update ticket status (Open/In Progress/Resolved)
5. Assign tickets to team members

**Communication:**
- Send email notifications
- WhatsApp messages (if integrated)
- SMS notifications for order updates

---

## Inventory Management

### Stock Overview

**Inventory Dashboard:**
- Total products in stock
- Low stock alerts
- Out of stock items
- Stock value

### Managing Stock Levels

1. **Update Individual Product Stock**
   - Go to Products → All Products
   - Click "Quick Edit" on product
   - Update stock quantity
   - Save changes

2. **Bulk Stock Update**
   - Go to Inventory → Bulk Update
   - Upload CSV file with stock updates
   - Review changes before applying

3. **Stock Alerts**
   - Set low stock thresholds per product
   - Receive notifications when stock is low
   - Generate reorder reports

### Inventory Reports

**Available Reports:**
- **Stock Levels**: Current inventory status
- **Low Stock**: Items needing reorder
- **Stock Movement**: Inventory changes over time
- **Valuation**: Total inventory value

---

## Reports & Analytics

### Sales Reports

1. **Daily Sales Report**
   - Revenue by day
   - Number of orders
   - Average order value
   - Top-selling products

2. **Monthly Sales Report**
   - Monthly revenue trends
   - Year-over-year comparison
   - Seasonal patterns
   - Customer acquisition

3. **Product Performance**
   - Best-selling products
   - Revenue by category
   - Profit margins
   - Inventory turnover

### Customer Analytics

- **Customer Acquisition**: New customers over time
- **Customer Lifetime Value**: Average customer value
- **Retention Rate**: Repeat customer percentage
- **Geographic Distribution**: Customers by location

### Generating Reports

1. Go to Reports → Select Report Type
2. Choose date range
3. Apply filters (if needed)
4. Click "Generate Report"
5. Export as PDF or CSV

---

## System Settings

### General Settings

1. **Store Information**
   - Store name and description
   - Contact information
   - Business hours
   - Social media links

2. **Currency & Localization**
   - Currency (KES)
   - Date format
   - Time zone (EAT)
   - Language settings

### Payment Settings

**M-Pesa Configuration:**
- Consumer Key and Secret
- Shortcode
- Passkey
- Callback URLs

**Other Payment Methods:**
- Credit/Debit card settings
- Bank transfer details
- Payment gateway configuration

### Shipping Settings

1. **Delivery Locations**
   - Add/edit delivery areas
   - Set delivery fees
   - Estimated delivery times

2. **Shipping Rules**
   - Free shipping thresholds
   - Weight-based pricing
   - Express delivery options

### Email Settings

**SMTP Configuration:**
- Email server settings
- Authentication credentials
- Email templates
- Notification preferences

### Security Settings

1. **User Management**
   - Add/remove admin users
   - Set user permissions
   - Password policies

2. **Security Features**
   - Two-factor authentication
   - Login attempt limits
   - IP restrictions
   - Session timeouts

---

## Troubleshooting

### Common Issues

**Problem: Cannot upload product images**
- Check file size (max 5MB)
- Ensure file format is JPG, PNG, or WebP
- Verify internet connection

**Problem: Orders not updating**
- Check payment gateway connection
- Verify webhook URLs
- Review error logs

**Problem: Email notifications not sending**
- Verify SMTP settings
- Check email templates
- Test email configuration

### Getting Help

**Support Channels:**
- Email: support@householdplanet.co.ke
- WhatsApp: +254700000000
- Documentation: Available in admin panel
- Video tutorials: Link in help section

### System Maintenance

**Regular Tasks:**
- Daily: Review new orders and payments
- Weekly: Check inventory levels and reports
- Monthly: Review customer feedback and analytics
- Quarterly: Update system settings and security

**Backup Procedures:**
- Automatic daily backups
- Manual backup option in Settings
- Restore procedures documented separately

---

## Keyboard Shortcuts

- **Ctrl + S**: Save current form
- **Ctrl + N**: Create new item (context-dependent)
- **Ctrl + F**: Search/Filter
- **Esc**: Close modal/popup
- **Tab**: Navigate between form fields

## Mobile Admin Access

The admin panel is mobile-responsive. Access via mobile browser:
- All core functions available
- Optimized for touch interface
- Push notifications for urgent alerts
- Offline capability for basic functions

---

*For additional help or training, contact the technical support team.*