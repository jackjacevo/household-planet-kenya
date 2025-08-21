# Manual Testing Checklist

## 👥 User Acceptance Testing

### Customer Journey 1: New User Registration
- [ ] Register with email/phone
- [ ] Email verification works
- [ ] Profile setup complete
- [ ] Welcome email received

### Customer Journey 2: Product Discovery
- [ ] Browse categories
- [ ] Search functionality
- [ ] Filter by price/brand
- [ ] Product details accurate

### Customer Journey 3: Shopping Cart
- [ ] Add/remove items
- [ ] Update quantities
- [ ] Cart persists across sessions
- [ ] Price calculations correct

### Customer Journey 4: Checkout Process
- [ ] Guest checkout works
- [ ] Address validation
- [ ] Payment method selection
- [ ] Order confirmation

### Customer Journey 5: Order Management
- [ ] Order tracking works
- [ ] Status updates received
- [ ] Delivery notifications
- [ ] Order history accessible

## 🔧 Admin Panel Testing

### Product Management
- [ ] Add new products
- [ ] Edit existing products
- [ ] Upload product images
- [ ] Manage inventory levels
- [ ] Bulk operations work

### Order Management
- [ ] View all orders
- [ ] Update order status
- [ ] Process refunds
- [ ] Generate reports
- [ ] Export order data

### User Management
- [ ] View customer list
- [ ] Customer support tools
- [ ] Ban/unban users
- [ ] View user analytics

## 🌐 Cross-Browser Testing

### Chrome (Latest)
- [ ] All features work
- [ ] UI renders correctly
- [ ] Performance acceptable

### Firefox (Latest)
- [ ] All features work
- [ ] UI renders correctly
- [ ] Performance acceptable

### Safari (Latest)
- [ ] All features work
- [ ] UI renders correctly
- [ ] Performance acceptable

### Edge (Latest)
- [ ] All features work
- [ ] UI renders correctly
- [ ] Performance acceptable

## 📱 Mobile Device Testing

### iOS Devices
- [ ] iPhone 12/13/14 (Safari)
- [ ] iPad (Safari)
- [ ] Touch interactions work
- [ ] Responsive design
- [ ] PWA installation

### Android Devices
- [ ] Samsung Galaxy (Chrome)
- [ ] Google Pixel (Chrome)
- [ ] Touch interactions work
- [ ] Responsive design
- [ ] PWA installation

## 💳 Payment Gateway Testing

### M-Pesa Integration
- [ ] STK Push works
- [ ] Payment confirmation
- [ ] Failed payment handling
- [ ] Refund processing

### Test Transactions
- [ ] Small amount (KSh 10)
- [ ] Medium amount (KSh 1,000)
- [ ] Large amount (KSh 10,000)
- [ ] Failed payment scenarios

## 📧 Communication Testing

### Email Delivery
- [ ] Registration confirmation
- [ ] Order confirmation
- [ ] Shipping notifications
- [ ] Marketing emails
- [ ] Password reset

### SMS Testing
- [ ] OTP verification
- [ ] Order updates
- [ ] Delivery notifications
- [ ] Promotional messages

### WhatsApp Integration
- [ ] Order confirmations
- [ ] Delivery updates
- [ ] Customer support
- [ ] Promotional messages

## Test Environment Setup
- Staging URL: https://staging.householdplanet.co.ke
- Test M-Pesa: Use sandbox credentials
- Test devices available in office
- Browser testing tools: BrowserStack/CrossBrowserTesting

## Sign-off Requirements
- [ ] Product Owner approval
- [ ] Technical Lead approval
- [ ] QA Lead approval
- [ ] Stakeholder approval