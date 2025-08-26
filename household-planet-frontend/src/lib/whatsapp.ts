import { Product } from '@/types';

// WhatsApp business number for Household Planet Kenya
export const WHATSAPP_NUMBER = '+254790227760';

/**
 * Generate WhatsApp message for product inquiry/order
 */
export function generateProductWhatsAppMessage(product: Product): string {
  const message = `Hello! I'm interested in ordering this product from Household Planet Kenya:

🛍️ *${product.name}*
💰 Price: Ksh ${product.price.toLocaleString()}
📝 SKU: ${product.sku}

${product.shortDescription}

Please let me know about availability and delivery options.

Thank you!`;

  return message;
}

/**
 * Open WhatsApp with pre-filled message for product order
 */
export function openWhatsAppForProduct(product: Product): void {
  const message = generateProductWhatsAppMessage(product);
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=${encodedMessage}`;
  
  // Track WhatsApp product inquiry
  trackWhatsAppInquiry(product);
  
  window.open(whatsappUrl, '_blank');
}

/**
 * Track WhatsApp product inquiry
 */
async function trackWhatsAppInquiry(product: Product): Promise<void> {
  try {
    const inquiryData = {
      productId: product.id,
      productName: product.name,
      productPrice: product.price,
      sku: product.sku,
      timestamp: new Date().toISOString(),
      sessionId: getSessionId()
    };
    
    // Send to backend for tracking (non-blocking)
    fetch('/api/analytics/whatsapp-inquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inquiryData)
    }).catch(error => {
      // Silently fail - don't block WhatsApp functionality
      console.debug('WhatsApp tracking failed:', error);
    });
  } catch (error) {
    // Silently fail - don't block WhatsApp functionality
    console.debug('WhatsApp tracking error:', error);
  }
}

/**
 * Get or create session ID for tracking
 */
function getSessionId(): string {
  let sessionId = localStorage.getItem('whatsapp_session_id');
  if (!sessionId) {
    sessionId = `wa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('whatsapp_session_id', sessionId);
  }
  return sessionId;
}

/**
 * Generate WhatsApp message for general inquiry
 */
export function generateGeneralWhatsAppMessage(): string {
  return "Hello! I'm interested in your household products from Household Planet Kenya.";
}

/**
 * Open WhatsApp for general inquiry
 */
export function openWhatsAppGeneral(): void {
  const message = generateGeneralWhatsAppMessage();
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=${encodedMessage}`;
  
  window.open(whatsappUrl, '_blank');
}