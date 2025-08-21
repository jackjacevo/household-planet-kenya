#!/bin/bash

# Complete Go-Live Testing Suite
set -e

echo "🚀 Starting Complete Go-Live Testing Suite..."
echo "================================================"

# Set environment variables
export NODE_ENV=production
export API_URL=https://api.householdplanet.co.ke
export FRONTEND_URL=https://householdplanet.co.ke

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install axios puppeteer
fi

echo ""
echo "🔄 1. Testing Payment Systems..."
echo "--------------------------------"
node payment-testing.js

echo ""
echo "🔄 2. Testing Delivery System..."
echo "--------------------------------"
node delivery-testing.js

echo ""
echo "🔄 3. Testing Notifications..."
echo "------------------------------"
node notification-testing.js

echo ""
echo "🔄 4. Testing End-to-End Order Flow..."
echo "--------------------------------------"
node end-to-end-testing.js

echo ""
echo "🔄 5. Testing Mobile & PWA..."
echo "-----------------------------"
node mobile-pwa-testing.js

echo ""
echo "🔄 6. Testing Security & Monitoring..."
echo "-------------------------------------"
node security-monitoring-testing.js

echo ""
echo "🔄 7. Manual Verification Checklist..."
echo "--------------------------------------"

# Manual checks that need human verification
echo "Please manually verify the following:"
echo ""
echo "Admin Panel:"
echo "[ ] Login to admin panel: ${FRONTEND_URL}/admin"
echo "[ ] Create a test product"
echo "[ ] Process a test order"
echo "[ ] Generate a report"
echo "[ ] Update inventory levels"
echo ""
echo "Customer Experience:"
echo "[ ] Register new customer account"
echo "[ ] Browse products and categories"
echo "[ ] Add items to cart"
echo "[ ] Complete checkout process"
echo "[ ] Receive email confirmations"
echo "[ ] Track order status"
echo ""
echo "Mobile Experience:"
echo "[ ] Test on actual mobile devices"
echo "[ ] Install PWA from browser"
echo "[ ] Test offline functionality"
echo "[ ] Verify touch interactions"
echo ""
echo "Payment Integration:"
echo "[ ] Complete real M-Pesa transaction (small amount)"
echo "[ ] Test card payment with real card"
echo "[ ] Verify payment confirmations"
echo "[ ] Test refund process"
echo ""
echo "Delivery Integration:"
echo "[ ] Place test order to real address"
echo "[ ] Verify delivery calculation accuracy"
echo "[ ] Test tracking notifications"
echo "[ ] Confirm delivery completion"
echo ""

echo "================================================"
echo "✅ Automated Testing Complete!"
echo ""
echo "Next Steps:"
echo "1. Complete manual verification checklist above"
echo "2. Fix any issues found during testing"
echo "3. Re-run tests after fixes"
echo "4. Get final approval from stakeholders"
echo "5. Schedule go-live date and time"
echo ""
echo "🎉 Ready for Production Launch!"