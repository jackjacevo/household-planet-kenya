const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyTrackingNumbers() {
  try {
    console.log('🔍 Verifying tracking numbers for all orders...');
    
    // Get all orders with their tracking numbers
    const orders = await prisma.order.findMany({
      select: {
        id: true,
        orderNumber: true,
        trackingNumber: true,
        source: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📦 Total orders: ${orders.length}`);

    // Check for orders without tracking numbers
    const ordersWithoutTracking = orders.filter(order => !order.trackingNumber);
    const ordersWithTracking = orders.filter(order => order.trackingNumber);

    console.log(`✅ Orders with tracking numbers: ${ordersWithTracking.length}`);
    console.log(`❌ Orders without tracking numbers: ${ordersWithoutTracking.length}`);

    if (ordersWithoutTracking.length > 0) {
      console.log('\n❌ Orders missing tracking numbers:');
      ordersWithoutTracking.forEach(order => {
        console.log(`  - ${order.orderNumber} (${order.source})`);
      });
    }

    // Show the specific orders mentioned in the issue
    const specificOrders = ['WA-1756162002237-96D3', 'WA-1756159520764-BA26'];
    console.log('\n🎯 Checking specific orders from the issue:');
    
    for (const orderNumber of specificOrders) {
      const order = orders.find(o => o.orderNumber === orderNumber);
      if (order) {
        console.log(`  ✅ ${orderNumber}: ${order.trackingNumber || 'NO TRACKING NUMBER'}`);
      } else {
        console.log(`  ❌ ${orderNumber}: Order not found`);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`  - All orders have tracking numbers: ${ordersWithoutTracking.length === 0 ? 'YES' : 'NO'}`);
    console.log(`  - Coverage: ${((ordersWithTracking.length / orders.length) * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('❌ Error verifying tracking numbers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the verification
verifyTrackingNumbers();