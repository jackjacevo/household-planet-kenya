const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Mock OrderIdService for testing
class OrderIdService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async generateOrderId(source = 'WEB') {
    const prefix = this.getPrefix(source);
    const now = new Date();
    
    // Format: YYYYMMDD-HHMMSS
    const dateStr = now.getFullYear().toString() +
                   (now.getMonth() + 1).toString().padStart(2, '0') +
                   now.getDate().toString().padStart(2, '0');
    
    const timeStr = now.getHours().toString().padStart(2, '0') +
                   now.getMinutes().toString().padStart(2, '0') +
                   now.getSeconds().toString().padStart(2, '0');
    
    // Generate random 4-character suffix
    const randomSuffix = require('crypto').randomBytes(2).toString('hex').toUpperCase();
    
    let orderNumber;
    let attempts = 0;
    const maxAttempts = 10;
    
    // Ensure uniqueness
    do {
      if (attempts > 0) {
        // Add extra randomness if collision occurs
        const extraRandom = require('crypto').randomBytes(1).toString('hex').toUpperCase();
        orderNumber = `${prefix}-${dateStr}-${timeStr}-${randomSuffix}${extraRandom}`;
      } else {
        orderNumber = `${prefix}-${dateStr}-${timeStr}-${randomSuffix}`;
      }
      
      const existing = await this.prisma.order.findUnique({
        where: { orderNumber }
      });
      
      if (!existing) {
        return orderNumber;
      }
      
      attempts++;
    } while (attempts < maxAttempts);
    
    // Fallback to timestamp-based if all attempts fail
    return `${prefix}-${Date.now()}-${require('crypto').randomBytes(3).toString('hex').toUpperCase()}`;
  }

  getPrefix(source) {
    switch (source) {
      case 'WHATSAPP':
        return 'WA';
      case 'ADMIN':
        return 'AD';
      case 'WEB':
      default:
        return 'HP';
    }
  }

  isValidOrderNumber(orderNumber) {
    const pattern = /^(HP|WA|AD)-\d{8}-\d{6}-[A-F0-9]{4,6}$/;
    return pattern.test(orderNumber);
  }

  getOrderSource(orderNumber) {
    if (orderNumber.startsWith('WA-')) return 'WHATSAPP';
    if (orderNumber.startsWith('AD-')) return 'ADMIN';
    if (orderNumber.startsWith('HP-')) return 'WEB';
    return 'UNKNOWN';
  }
}

async function testOrderIdGeneration() {
  console.log('🧪 Testing Order ID Generation System...\n');
  
  const orderIdService = new OrderIdService(prisma);
  
  try {
    // Test different order sources
    const webOrderId = await orderIdService.generateOrderId('WEB');
    const whatsappOrderId = await orderIdService.generateOrderId('WHATSAPP');
    const adminOrderId = await orderIdService.generateOrderId('ADMIN');
    
    console.log('✅ Generated Order IDs:');
    console.log(`   Web Order:      ${webOrderId}`);
    console.log(`   WhatsApp Order: ${whatsappOrderId}`);
    console.log(`   Admin Order:    ${adminOrderId}\n`);
    
    // Test validation
    console.log('✅ Validation Tests:');
    console.log(`   ${webOrderId} is valid: ${orderIdService.isValidOrderNumber(webOrderId)}`);
    console.log(`   ${whatsappOrderId} is valid: ${orderIdService.isValidOrderNumber(whatsappOrderId)}`);
    console.log(`   ${adminOrderId} is valid: ${orderIdService.isValidOrderNumber(adminOrderId)}`);
    console.log(`   "INVALID-123" is valid: ${orderIdService.isValidOrderNumber('INVALID-123')}\n`);
    
    // Test source detection
    console.log('✅ Source Detection:');
    console.log(`   ${webOrderId} source: ${orderIdService.getOrderSource(webOrderId)}`);
    console.log(`   ${whatsappOrderId} source: ${orderIdService.getOrderSource(whatsappOrderId)}`);
    console.log(`   ${adminOrderId} source: ${orderIdService.getOrderSource(adminOrderId)}\n`);
    
    // Test uniqueness by generating multiple IDs quickly
    console.log('✅ Uniqueness Test (generating 5 IDs quickly):');
    const ids = [];
    for (let i = 0; i < 5; i++) {
      const id = await orderIdService.generateOrderId('WEB');
      ids.push(id);
      console.log(`   ${i + 1}. ${id}`);
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const uniqueIds = new Set(ids);
    console.log(`   All ${ids.length} IDs are unique: ${uniqueIds.size === ids.length}\n`);
    
    // Check existing orders in database
    const existingOrders = await prisma.order.findMany({
      select: { orderNumber: true, source: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    console.log('📋 Recent Orders in Database:');
    if (existingOrders.length > 0) {
      existingOrders.forEach((order, index) => {
        const source = orderIdService.getOrderSource(order.orderNumber);
        const isValid = orderIdService.isValidOrderNumber(order.orderNumber);
        console.log(`   ${index + 1}. ${order.orderNumber} (${source}) - Valid: ${isValid}`);
      });
    } else {
      console.log('   No orders found in database');
    }
    
    console.log('\n🎉 Order ID Generation System Test Complete!');
    
  } catch (error) {
    console.error('❌ Error testing order ID generation:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testOrderIdGeneration();