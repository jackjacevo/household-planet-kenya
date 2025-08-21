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
  
  window.open(whatsappUrl, '_blank');
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