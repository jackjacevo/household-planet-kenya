const { PrismaClient } = require('@prisma/client');

async function checkPaymentData() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Checking database for orders and payments...\n');
    
    // Check total orders
    const totalOrders = await prisma.order.count();
    console.log(`Total orders: ${totalOrders}`);
    
    // Check orders with payment transactions
    const ordersWithPayments = await prisma.order.findMany({
      include: {
        paymentTransactions: true,
        user: { select: { name: true, email: true } },
        items: { 
          include: { 
            product: { select: { name: true } } 
          } 
        }
      },
      take: 5
    });
    
    console.log(`\nFound ${ordersWithPayments.length} orders (showing first 5):`);
    
    ordersWithPayments.forEach((order, index) => {
      console.log(`\n--- Order ${index + 1} ---`);
      console.log(`ID: ${order.id}`);
      console.log(`Order Number: ${order.orderNumber}`);
      console.log(`Status: ${order.status}`);
      console.log(`Payment Status: ${order.paymentStatus}`);
      console.log(`Total: KSh ${order.total}`);
      console.log(`Subtotal: ${order.subtotal}`);
      console.log(`Shipping: ${order.shippingCost}`);
      console.log(`Delivery Price: ${order.deliveryPrice}`);
      console.log(`Customer: ${order.user?.name || 'Guest'} (${order.user?.email || 'N/A'})`);
      console.log(`Items: ${order.items.length}`);
      console.log(`Payment Transactions: ${order.paymentTransactions.length}`);
      
      if (order.paymentTransactions.length > 0) {
        order.paymentTransactions.forEach((payment, pIndex) => {
          console.log(`  Payment ${pIndex + 1}: ${payment.status} - KSh ${payment.amount} (${payment.provider})`);
        });
      }
    });
    
    // Check for completed payments specifically
    const completedPayments = await prisma.paymentTransaction.findMany({
      where: { status: 'COMPLETED' },
      include: {
        order: { select: { orderNumber: true, total: true } }
      },
      take: 3
    });
    
    console.log(`\n\nCompleted payments: ${completedPayments.length}`);
    completedPayments.forEach((payment, index) => {
      console.log(`Payment ${index + 1}: Order ${payment.order?.orderNumber} - KSh ${payment.amount} (${payment.provider})`);
    });
    
    // If we have a completed payment, let's try to generate a receipt for it
    if (completedPayments.length > 0) {
      const testOrderId = completedPayments[0].orderId;
      console.log(`\nTesting receipt generation for order ID: ${testOrderId}`);
      
      // This would be the same logic as in the service
      const testOrder = await prisma.order.findUnique({
        where: { id: testOrderId },
        include: {
          user: true,
          items: { 
            include: { 
              product: { select: { name: true, images: true } },
              variant: { select: { name: true } }
            } 
          },
          paymentTransactions: { 
            where: { status: 'COMPLETED' },
            orderBy: { createdAt: 'desc' }
          }
        }
      });
      
      if (testOrder) {
        console.log('Test order data structure:');
        console.log('- User:', testOrder.user ? 'Present' : 'Missing');
        console.log('- Items:', testOrder.items.length);
        console.log('- Payment Transactions:', testOrder.paymentTransactions.length);
        console.log('- Subtotal:', testOrder.subtotal);
        console.log('- Total:', testOrder.total);
        console.log('- Shipping Cost:', testOrder.shippingCost);
        console.log('- Delivery Price:', testOrder.deliveryPrice);
        
        if (testOrder.items.length > 0) {
          console.log('- First item product:', testOrder.items[0].product ? 'Present' : 'Missing');
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPaymentData();