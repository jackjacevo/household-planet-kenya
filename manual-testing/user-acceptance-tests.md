# User Acceptance Test Scripts

## UAT-001: New Customer Registration

### Pre-conditions
- User has valid email and phone number
- No existing account with same email

### Test Steps
1. Navigate to registration page
2. Fill in personal details
3. Enter valid email address
4. Create strong password
5. Accept terms and conditions
6. Click "Create Account"
7. Check email for verification
8. Click verification link
9. Complete profile setup

### Expected Results
- Account created successfully
- Verification email received within 2 minutes
- Profile accessible after verification
- Welcome email sent

### Acceptance Criteria
- [ ] Registration form validates inputs
- [ ] Email verification required
- [ ] User redirected to dashboard
- [ ] Welcome email received

---

## UAT-002: Product Search and Discovery

### Pre-conditions
- Products exist in database
- Search functionality enabled

### Test Steps
1. Navigate to products page
2. Use search bar with "kitchen"
3. Apply price filter (KSh 500-2000)
4. Select category filter
5. Sort by price (low to high)
6. Click on product card
7. View product details

### Expected Results
- Search returns relevant results
- Filters work correctly
- Sorting functions properly
- Product details complete

### Acceptance Criteria
- [ ] Search finds relevant products
- [ ] Filters reduce result set
- [ ] Sorting changes order
- [ ] Product details accurate

---

## UAT-003: Shopping Cart Management

### Pre-conditions
- User logged in
- Products available for purchase

### Test Steps
1. Browse products
2. Click "Add to Cart" on product
3. Navigate to cart page
4. Update quantity of item
5. Remove one item
6. Add another product
7. Verify total calculation
8. Proceed to checkout

### Expected Results
- Items added to cart successfully
- Quantity updates work
- Item removal works
- Total calculates correctly

### Acceptance Criteria
- [ ] Cart updates in real-time
- [ ] Quantities can be modified
- [ ] Items can be removed
- [ ] Totals calculate correctly

---

## UAT-004: Checkout and Payment

### Pre-conditions
- User has items in cart
- Valid delivery address
- M-Pesa account with funds

### Test Steps
1. Proceed from cart to checkout
2. Confirm delivery address
3. Select M-Pesa payment
4. Enter phone number
5. Complete M-Pesa payment
6. Receive order confirmation
7. Check email for receipt

### Expected Results
- Checkout process smooth
- Payment completes successfully
- Order confirmation displayed
- Email receipt received

### Acceptance Criteria
- [ ] Address validation works
- [ ] M-Pesa integration functional
- [ ] Order created in system
- [ ] Confirmation email sent

---

## UAT-005: Order Tracking

### Pre-conditions
- User has placed an order
- Order processing system active

### Test Steps
1. Login to user account
2. Navigate to order history
3. Click on recent order
4. View order details
5. Check tracking status
6. Verify delivery information

### Expected Results
- Order appears in history
- Details match original order
- Status updates visible
- Tracking information available

### Acceptance Criteria
- [ ] Order history accessible
- [ ] Order details accurate
- [ ] Status updates real-time
- [ ] Tracking information clear

---

## UAT-006: Admin Product Management

### Pre-conditions
- Admin user logged in
- Admin panel accessible

### Test Steps
1. Login as admin user
2. Navigate to products section
3. Click "Add New Product"
4. Fill product information
5. Upload product images
6. Set pricing and inventory
7. Publish product
8. Verify on frontend

### Expected Results
- Product creation form works
- Images upload successfully
- Product appears on site
- All details display correctly

### Acceptance Criteria
- [ ] Product form validates
- [ ] Image upload works
- [ ] Product publishes correctly
- [ ] Frontend displays product

## Test Sign-off

### Stakeholder Approval
- [ ] Business Owner: _________________ Date: _______
- [ ] Technical Lead: _________________ Date: _______
- [ ] QA Manager: ___________________ Date: _______
- [ ] Product Manager: _______________ Date: _______

### Notes
_Space for additional comments and observations_