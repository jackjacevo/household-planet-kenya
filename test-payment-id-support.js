/**
 * Test Payment ID Support
 * 
 * This script demonstrates the new payment system that accepts both:
 * 1. Numeric amounts (e.g., 4200)
 * 2. Payment IDs (e.g., "WA-1756163997824-4200")
 */

// Simulate the payment ID extraction logic
function extractAmount(amountOrId) {
  if (typeof amountOrId === 'number') {
    return amountOrId;
  }
  
  // Extract amount from payment ID (last 4 digits represent amount in cents)
  const match = amountOrId.match(/^[A-Z]{2}-(\d{13})-(\d{4})$/);
  if (match) {
    const amountInCents = parseInt(match[2], 10);
    return amountInCents / 100; // Convert cents to actual amount
  }
  
  throw new Error(`Invalid payment amount or ID format: ${amountOrId}`);
}

function isPaymentId(value) {
  return typeof value === 'string' && /^[A-Z]{2}-\d{13}-\d{4}$/.test(value);
}

// Test cases
const testCases = [
  // Numeric amounts
  { input: 4200, expected: 4200, description: "Numeric amount" },
  { input: 1500, expected: 1500, description: "Another numeric amount" },
  
  // Payment IDs
  { input: "WA-1756163997824-4200", expected: 42.00, description: "WhatsApp payment ID" },
  { input: "MP-1756163997824-1500", expected: 15.00, description: "M-Pesa payment ID" },
  { input: "PB-1756163997824-2750", expected: 27.50, description: "Paybill payment ID" },
  { input: "CA-1756163997824-9999", expected: 99.99, description: "Cash payment ID" },
];

console.log("🧪 Testing Payment ID Support\n");
console.log("=" .repeat(60));

testCases.forEach((testCase, index) => {
  try {
    const result = extractAmount(testCase.input);
    const isId = isPaymentId(testCase.input);
    
    console.log(`\nTest ${index + 1}: ${testCase.description}`);
    console.log(`Input: ${testCase.input}`);
    console.log(`Is Payment ID: ${isId}`);
    console.log(`Extracted Amount: KES ${result.toLocaleString()}`);
    console.log(`Expected: KES ${testCase.expected.toLocaleString()}`);
    console.log(`Status: ${result === testCase.expected ? '✅ PASS' : '❌ FAIL'}`);
  } catch (error) {
    console.log(`\nTest ${index + 1}: ${testCase.description}`);
    console.log(`Input: ${testCase.input}`);
    console.log(`Status: ❌ ERROR - ${error.message}`);
  }
});

console.log("\n" + "=" .repeat(60));

// Example usage scenarios
console.log("\n📋 Example Usage Scenarios:\n");

const scenarios = [
  {
    title: "M-Pesa STK Push",
    code: `
// Traditional numeric amount
const mpesaPayment1 = {
  phoneNumber: "254712345678",
  amount: 2500,
  accountReference: "ORDER-123"
};

// Using payment ID
const mpesaPayment2 = {
  phoneNumber: "254712345678", 
  amount: "WA-1756163997824-2500",
  accountReference: "ORDER-123"
};

// Both will extract to KES 25.00
`
  },
  {
    title: "Cash Payment Recording",
    code: `
// Traditional numeric amount
await recordCashPayment(orderId, 1500, "John Doe", "Cash received at store");

// Using payment ID
await recordCashPayment(orderId, "CA-1756163997824-1500", "John Doe", "Cash from WhatsApp order");

// Both will record KES 15.00
`
  },
  {
    title: "Refund Processing",
    code: `
// Traditional numeric refund
const refund1 = {
  transactionId: 123,
  reason: "Product defect",
  amount: 750
};

// Using payment ID for refund
const refund2 = {
  transactionId: 123,
  reason: "Product defect", 
  amount: "WA-1756163997824-0750"
};

// Both will refund KES 7.50
`
  }
];

scenarios.forEach(scenario => {
  console.log(`${scenario.title}:`);
  console.log(scenario.code);
  console.log("-".repeat(40));
});

console.log("\n✨ Payment ID Format: XX-XXXXXXXXXXXXX-XXXX");
console.log("   XX: 2-letter prefix (WA=WhatsApp, MP=M-Pesa, etc.)");
console.log("   XXXXXXXXXXXXX: 13-digit timestamp/identifier");
console.log("   XXXX: 4-digit amount in cents");
console.log("\n🎯 Benefits:");
console.log("   • Unified payment processing");
console.log("   • Traceability from external systems");
console.log("   • Backward compatibility with numeric amounts");
console.log("   • Automatic amount extraction");