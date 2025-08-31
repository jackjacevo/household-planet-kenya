const { PrismaClient } = require('@prisma/client');
const { randomBytes } = require('crypto');

const prisma = new PrismaClient();

async function fixMissingTrackingNumbers() {
  try {
    console.log('🔍 Finding orders without tracking numbers...');
    
    // Find orders without tracking numbers
    const ordersWithoutTracking = await prisma.order.findMany({
      where: {
        OR: [
          { trackingNumber: null },
          { trackingNumber: '' }
        ]
      },
      select: {
        id: true,
        orderNumber: true,
        createdAt: true,
        source: true
      }
    });

    console.log(`📦 Found ${ordersWithoutTracking.length} orders without tracking numbers`);

    if (ordersWithoutTracking.length === 0) {
      console.log('✅ All orders already have tracking numbers!');
      return;
    }

    // Update each order with a tracking number
    for (const order of ordersWithoutTracking) {
      const trackingNumber = `TRK-${Date.now()}-${order.id}-${randomBytes(2).toString('hex').toUpperCase()}`;
      
      await prisma.order.update({
        where: { id: order.id },
        data: { trackingNumber }
      });

      console.log(`✅ Added tracking number ${trackingNumber} to order ${order.orderNumber}`);
      
      // Small delay to ensure unique timestamps
      await new Promise(resolve => setTimeout(resolve, 1));
    }

    console.log(`🎉 Successfully added tracking numbers to ${ordersWithoutTracking.length} orders!`);

    // Verify the fix
    const remainingOrders = await prisma.order.count({
      where: {
        OR: [
          { trackingNumber: null },
          { trackingNumber: '' }
        ]
      }
    });

    console.log(`📊 Orders still without tracking numbers: ${remainingOrders}`);

  } catch (error) {
    console.error('❌ Error fixing tracking numbers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixMissingTrackingNumbers();