# Payment Testing Scenarios

## M-Pesa Testing

### Test Account Details
- **Shortcode**: 174379 (Sandbox)
- **Passkey**: bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
- **Test Phone**: 254708374149

### Successful Payment Tests
1. **Small Transaction (KSh 10)**
   - [ ] STK push sent
   - [ ] User enters PIN
   - [ ] Payment confirmed
   - [ ] Order status updated

2. **Medium Transaction (KSh 1,000)**
   - [ ] STK push sent
   - [ ] User enters PIN
   - [ ] Payment confirmed
   - [ ] Order status updated

3. **Large Transaction (KSh 10,000)**
   - [ ] STK push sent
   - [ ] User enters PIN
   - [ ] Payment confirmed
   - [ ] Order status updated

### Failed Payment Tests
1. **Insufficient Funds**
   - [ ] STK push sent
   - [ ] Payment fails
   - [ ] Error message shown
   - [ ] Order remains pending

2. **User Cancellation**
   - [ ] STK push sent
   - [ ] User cancels
   - [ ] Timeout handled
   - [ ] Order cancelled

3. **Network Timeout**
   - [ ] STK push sent
   - [ ] Network fails
   - [ ] Timeout handled
   - [ ] Retry mechanism works

## Email Testing

### SMTP Configuration
- **Provider**: SendGrid/Mailgun
- **Test Email**: test@householdplanetkenya.co.ke

### Email Templates
1. **Registration Confirmation**
   - [ ] Subject line correct
   - [ ] Content renders properly
   - [ ] Links work
   - [ ] Unsubscribe link present

2. **Order Confirmation**
   - [ ] Order details accurate
   - [ ] Total amount correct
   - [ ] Delivery info included
   - [ ] Tracking link works

3. **Shipping Notification**
   - [ ] Tracking number included
   - [ ] Delivery estimate shown
   - [ ] Carrier information correct

## SMS Testing

### Provider: Africa's Talking
- **Username**: sandbox
- **API Key**: [Sandbox Key]

### SMS Templates
1. **OTP Verification**
   - [ ] Code generated
   - [ ] SMS delivered
   - [ ] Code validates
   - [ ] Expiry works

2. **Order Updates**
   - [ ] Order confirmed SMS
   - [ ] Shipping SMS
   - [ ] Delivery SMS

## WhatsApp Testing

### WhatsApp Business API
- **Phone**: +254700000000
- **Webhook**: https://householdplanetkenya.co.ke/whatsapp

### Message Templates
1. **Order Confirmation**
   - [ ] Template approved
   - [ ] Variables populated
   - [ ] Message delivered
   - [ ] Interactive buttons work

2. **Delivery Updates**
   - [ ] Status updates sent
   - [ ] Location sharing works
   - [ ] Customer can reply

## Test Data

### Valid Test Cards
- **Visa**: 4111111111111111
- **Mastercard**: 5555555555554444
- **Expiry**: 12/25
- **CVV**: 123

### Test Phone Numbers
- **Kenya**: +254700000000
- **International**: +1234567890

### Test Email Addresses
- **Valid**: test@example.com
- **Invalid**: invalid-email
- **Disposable**: temp@10minutemail.com