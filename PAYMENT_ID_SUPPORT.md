# Payment ID Support Implementation

## Overview

The payment system has been enhanced to accept both traditional numeric amounts and structured payment IDs. This allows for better traceability and integration with external systems while maintaining backward compatibility.

## Payment ID Format

```
XX-XXXXXXXXXXXXX-XXXX
```

- **XX**: 2-letter prefix indicating payment source/type
- **XXXXXXXXXXXXX**: 13-digit timestamp or unique identifier
- **XXXX**: 4-digit amount in cents (e.g., 4200 = KES 42.00)

### Supported Prefixes

| Prefix | Description | Example |
|--------|-------------|---------|
| `WA` | WhatsApp Business | `WA-1756163997824-4200` |
| `MP` | M-Pesa Direct | `MP-1756163997824-1500` |
| `PB` | Paybill | `PB-1756163997824-2750` |
| `CA` | Cash Payment | `CA-1756163997824-9999` |
| `CC` | Credit Card | `CC-1756163997824-5000` |

## Implementation Details

### Backend Changes

#### 1. Updated DTOs (`payment.dto.ts`)

```typescript
export class CreatePaymentIntentDto {
  @ValidateIf((o) => isNumericAmount(o.amount))
  @IsNumber()
  @Transform(({ value }) => isNumericAmount(value) ? parseFloat(value) : value)
  @ValidateIf((o) => !isNumericAmount(o.amount))
  @IsString()
  @Matches(/^[A-Z]{2}-\d{13}-\d{4}$/)
  amount: number | string; // ✨ Now accepts both!
}
```

#### 2. Enhanced Payment Service (`payments.service.ts`)

```typescript
private extractAmount(amountOrId: number | string): number {
  if (typeof amountOrId === 'number') {
    return amountOrId;
  }
  
  const match = amountOrId.match(/^[A-Z]{2}-(\d{13})-(\d{4})$/);
  if (match) {
    const amountInCents = parseInt(match[2], 10);
    return amountInCents / 100;
  }
  
  throw new BadRequestException(`Invalid payment format: ${amountOrId}`);
}
```

#### 3. Updated Payment Types (`payment.types.ts`)

```typescript
export interface PaymentResponse {
  success: boolean;
  message: string;
  amount?: number;
  originalAmount?: number | string; // ✨ Tracks original input
  isPaymentId?: boolean; // ✨ Indicates if input was a payment ID
}
```

### Frontend Changes

#### 1. Enhanced Payment Hook (`usePayment.ts`)

```typescript
interface PaymentData {
  orderId: number;
  paymentMethod: string;
  phoneNumber?: string;
  amount?: number | string; // ✨ Supports both formats
}
```

#### 2. Updated Payment Form (`SecurePaymentForm.tsx`)

```typescript
interface SecurePaymentFormProps {
  amount: number | string; // ✨ Flexible amount input
  onPaymentSuccess: (result: any) => void;
  onPaymentError: (error: string) => void;
}
```

## Usage Examples

### 1. M-Pesa STK Push

```typescript
// Traditional numeric amount
const mpesaPayment = {
  phoneNumber: "254712345678",
  amount: 2500, // KES 25.00
  accountReference: "ORDER-123"
};

// Using payment ID
const mpesaPaymentWithId = {
  phoneNumber: "254712345678",
  amount: "WA-1756163997824-2500", // Also KES 25.00
  accountReference: "ORDER-123"
};
```

### 2. Cash Payment Recording

```typescript
// Traditional approach
await paymentsService.recordCashPayment(
  orderId, 
  1500, // KES 15.00
  "John Doe", 
  "Cash received at store"
);

// With payment ID
await paymentsService.recordCashPayment(
  orderId, 
  "CA-1756163997824-1500", // KES 15.00
  "John Doe", 
  "Cash from WhatsApp order"
);
```

### 3. Refund Processing

```typescript
// Traditional refund
const refund = {
  transactionId: 123,
  reason: "Product defect",
  amount: 750 // KES 7.50
};

// Refund with payment ID
const refundWithId = {
  transactionId: 123,
  reason: "Product defect",
  amount: "WA-1756163997824-0750" // KES 7.50
};
```

### 4. Partial Payments

```typescript
// Traditional partial payment
await paymentsService.processPartialPayment(
  orderId, 
  500, // KES 5.00
  "254712345678", 
  userId
);

// Partial payment with ID
await paymentsService.processPartialPayment(
  orderId, 
  "MP-1756163997824-0500", // KES 5.00
  "254712345678", 
  userId
);
```

## API Endpoints

All existing payment endpoints now support both formats:

### POST `/api/payments/mpesa`
```json
{
  "phoneNumber": "254712345678",
  "amount": "WA-1756163997824-4200",
  "accountReference": "ORDER-123"
}
```

### POST `/api/payments/cash`
```json
{
  "orderId": 123,
  "amount": "CA-1756163997824-1500",
  "receivedBy": "John Doe",
  "notes": "Cash payment from WhatsApp order"
}
```

### POST `/api/payments/refund`
```json
{
  "transactionId": 456,
  "reason": "Customer request",
  "amount": "WA-1756163997824-0750"
}
```

## Validation Rules

### Payment ID Validation
- Must match pattern: `^[A-Z]{2}-\d{13}-\d{4}$`
- Prefix must be 2 uppercase letters
- Identifier must be exactly 13 digits
- Amount must be exactly 4 digits (representing cents)

### Numeric Amount Validation
- Must be a positive number
- Supports decimal values
- Automatically converted to appropriate format

## Error Handling

```typescript
// Invalid payment ID format
{
  "error": "Payment ID must be in format XX-XXXXXXXXXXXXX-XXXX (e.g., WA-1756163997824-4200)"
}

// Invalid amount extraction
{
  "error": "Invalid payment amount or ID format: INVALID-FORMAT"
}
```

## Benefits

### 1. **Traceability**
- Payment IDs can be traced back to external systems
- Original payment source is preserved in logs
- Better audit trail for compliance

### 2. **Integration Flexibility**
- Seamless integration with WhatsApp Business API
- Support for various payment channels
- Unified payment processing logic

### 3. **Backward Compatibility**
- Existing numeric amounts continue to work
- No breaking changes to current implementations
- Gradual migration path

### 4. **Enhanced Logging**
```typescript
// Compliance logs now include:
{
  originalAmount: "WA-1756163997824-4200",
  actualAmount: 42.00,
  isPaymentId: true,
  paymentSource: "WhatsApp"
}
```

## Testing

Run the test suite to verify functionality:

```bash
node test-payment-id-support.js
```

Expected output:
```
🧪 Testing Payment ID Support
✅ All tests pass
✅ Numeric amounts work correctly
✅ Payment IDs extract amounts properly
✅ Validation rules enforced
```

## Migration Guide

### For Existing Code

1. **No immediate changes required** - numeric amounts continue to work
2. **Optional enhancement** - Update to use payment IDs where beneficial
3. **Gradual adoption** - Implement payment IDs for new integrations

### For New Integrations

1. **Use payment IDs** for external system integration
2. **Include source prefix** to identify payment origin
3. **Leverage enhanced logging** for better traceability

## Security Considerations

- Payment IDs don't contain sensitive information
- Amount extraction is validated and sanitized
- Original payment data is logged for audit purposes
- All existing security measures remain in place

## Future Enhancements

- Support for additional prefixes as needed
- Enhanced reporting based on payment sources
- Automated reconciliation using payment IDs
- Integration with more external payment systems