/**
 * Order validation utilities for Household Planet Kenya
 */

export interface OrderValidationResult {
  isValid: boolean;
  type: 'numeric' | 'orderNumber' | 'invalid';
  message?: string;
}

/**
 * Validates order ID or order number format
 * Supports:
 * - Numeric IDs (e.g., 1, 123, 4567)
 * - Order numbers with prefixes (HP-, WA-, AD-)
 * - Format: PREFIX-YYYYMMDD-HHMMSS-XXXX or PREFIX-timestamp-XXXX
 */
export function validateOrderId(input: string): OrderValidationResult {
  if (!input || input.trim() === '') {
    return {
      isValid: false,
      type: 'invalid',
      message: 'Order ID is required'
    };
  }

  const trimmedInput = input.trim();

  // Check if it's a numeric ID
  if (/^\d+$/.test(trimmedInput)) {
    const numericId = parseInt(trimmedInput);
    if (numericId > 0) {
      return {
        isValid: true,
        type: 'numeric'
      };
    } else {
      return {
        isValid: false,
        type: 'invalid',
        message: 'Numeric Order ID must be greater than 0'
      };
    }
  }

  // Check if it's an order number with proper format
  const orderNumberPatterns = [
    /^(HP|WA|AD)-\d{8}-\d{6}-[A-F0-9]{4,6}$/i, // Standard format: HP-20241201-143022-A1B2
    /^(HP|WA|AD)-\d{13}-\d{4}$/i,               // WhatsApp format: WA-1756163997824-4200
    /^(HP|WA|AD)-\d{10,13}-[A-F0-9]{2,6}$/i     // Flexible format
  ];

  const isValidOrderNumber = orderNumberPatterns.some(pattern => pattern.test(trimmedInput));

  if (isValidOrderNumber) {
    return {
      isValid: true,
      type: 'orderNumber'
    };
  }

  return {
    isValid: false,
    type: 'invalid',
    message: 'Invalid format. Use numeric ID (e.g., 123) or order number (e.g., WA-1756163997824-4200)'
  };
}

/**
 * Formats order ID for display
 */
export function formatOrderId(input: string): string {
  const validation = validateOrderId(input);
  
  if (!validation.isValid) {
    return input;
  }

  if (validation.type === 'numeric') {
    return `#${input}`;
  }

  return input.toUpperCase();
}

/**
 * Gets order source from order number
 */
export function getOrderSource(orderNumber: string): string {
  if (orderNumber.startsWith('WA-')) return 'WhatsApp';
  if (orderNumber.startsWith('AD-')) return 'Admin';
  if (orderNumber.startsWith('HP-')) return 'Website';
  return 'Unknown';
}

/**
 * Extracts amount from WhatsApp-style order numbers
 * Format: WA-timestamp-amount (where amount is in cents)
 */
export function extractAmountFromOrderNumber(orderNumber: string): number | null {
  const match = orderNumber.match(/^WA-\d{13}-(\d{4})$/);
  if (match) {
    return parseInt(match[1]) / 100; // Convert cents to actual amount
  }
  return null;
}
