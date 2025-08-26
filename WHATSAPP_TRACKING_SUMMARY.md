# WhatsApp Product Inquiry Tracking

## What Happens When Someone Clicks WhatsApp Button on a Product

### 1. Frontend Tracking
- When user clicks WhatsApp button on any product page
- System automatically tracks the inquiry with product details
- Stores: product ID, name, price, SKU, timestamp, session ID
- Opens WhatsApp with pre-filled message about the product

### 2. Backend Recording
- Inquiry gets stored in `analytics_events` table
- Event type: `whatsapp_product_inquiry`
- Contains all product information for correlation

### 3. Message Correlation
- When customer sends WhatsApp message after clicking button
- System checks if message contains product name or SKU
- Automatically flags as potential order if match found
- Links the inquiry to the incoming message

### 4. Admin Visibility
The admin panel now shows three tabs:

#### Pending Messages Tab
- Shows unprocessed WhatsApp messages
- Indicates if message relates to tracked product inquiry
- Allows manual order creation

#### WhatsApp Orders Tab  
- Shows completed orders created via WhatsApp
- Full order details with customer info
- Direct links to order management

#### Product Inquiries Tab (NEW)
- Shows all product WhatsApp button clicks
- Product details and click timestamps
- Helps identify popular products via WhatsApp

## Current Limitations

1. **Manual Webhook Setup Required**: WhatsApp Business API webhook needs configuration
2. **Message Correlation**: Relies on product name/SKU matching in messages
3. **No Direct Order Creation**: Still requires manual order entry from messages

## Benefits

1. **Track Interest**: See which products generate WhatsApp inquiries
2. **Better Context**: When messages arrive, system knows which product they're about
3. **Analytics**: Understand WhatsApp conversion funnel
4. **Improved Service**: Faster response with product context

## To See It Working

1. Go to any product page
2. Click the WhatsApp button
3. Check Admin → WhatsApp → Product Inquiries tab
4. The click will be recorded there

The system now tracks the complete journey from product interest to potential order via WhatsApp.