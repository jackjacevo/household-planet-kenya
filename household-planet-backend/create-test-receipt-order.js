const { PrismaClient } = require('@prisma/client');

async function createTestReceiptOrder() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Creating test order with completed payment for receipt testing...\n');
    
    // Find a recent order that doesn't have completed payment
    const orderWithoutPayment = await prisma.order.findFirst({
      where: {
        paymentStatus: { not: 'PAID' },
        status: { not: 'CANCELLED' }
      },
      include: {
        paymentTransactions: true,
        items: true
      }
    });
    
    if (!orderWithoutPayment) {
      console.log('No suitable order found. Creating a new test order...');
      
      // Create a new test order
      const testOrder = await prisma.order.create({
        data: {
          orderNumber: `TEST-${Date.now()}`,
          status: 'DELIVERED',
          subtotal: 25000,
          shippingCost: 500,
          total: 25500,
          shippingAddress: 'Test Address, Nairobi',
          paymentMethod: 'MPESA',
          paymentStatus: 'PAID',
          source: 'WEB'
        }
      });
      
      console.log(`Created test order: ${testOrder.orderNumber} (ID: ${testOrder.id})`);
      
      // Add test items to the order
      const products = await prisma.product.findMany({ take: 2 });
      
      if (products.length > 0) {
        for (const product of products) {
          await prisma.orderItem.create({
            data: {
              orderId: testOrder.id,
              productId: product.id,
              quantity: 1,
              price: product.price,
              total: product.price
            }
          });
          console.log(`Added item: ${product.name} - KSh ${product.price}`);
        }
      }
      
      // Create completed payment transaction
      const payment = await prisma.paymentTransaction.create({
        data: {
          orderId: testOrder.id,
          checkoutRequestId: `test_receipt_${Date.now()}`,
          phoneNumber: '254700123456',
          amount: testOrder.total,
          status: 'COMPLETED',
          provider: 'MPESA',
          paymentType: 'STK_PUSH',
          mpesaReceiptNumber: `TEST${Date.now()}`,
          transactionDate: new Date()
        }
      });
      
      console.log(`Created completed payment: KSh ${payment.amount}`);
      console.log(`\nTest order ready for receipt generation!`);
      console.log(`Order ID: ${testOrder.id}`);
      console.log(`Order Number: ${testOrder.orderNumber}`);
      
    } else {
      console.log(`Found order without completed payment: ${orderWithoutPayment.orderNumber} (ID: ${orderWithoutPayment.id})`);
      
      // Add items if missing
      if (orderWithoutPayment.items.length === 0) {
        const products = await prisma.product.findMany({ take: 2 });
        
        if (products.length > 0) {
          for (const product of products) {
            await prisma.orderItem.create({
              data: {
                orderId: orderWithoutPayment.id,
                productId: product.id,
                quantity: 1,
                price: product.price,
                total: product.price
              }
            });
            console.log(`Added item: ${product.name} - KSh ${product.price}`);
          }
        }
      }
      
      // Create completed payment transaction
      const payment = await prisma.paymentTransaction.create({
        data: {
          orderId: orderWithoutPayment.id,
          checkoutRequestId: `test_receipt_${Date.now()}`,
          phoneNumber: '254700123456',
          amount: orderWithoutPayment.total,
          status: 'COMPLETED',
          provider: 'MPESA',
          paymentType: 'STK_PUSH',
          mpesaReceiptNumber: `TEST${Date.now()}`,
          transactionDate: new Date()
        }
      });
      
      // Update order status
      await prisma.order.update({
        where: { id: orderWithoutPayment.id },
        data: {
          paymentStatus: 'PAID',
          status: 'DELIVERED'
        }
      });
      
      console.log(`Created completed payment: KSh ${payment.amount}`);
      console.log(`Updated order status to DELIVERED with PAID payment status`);
      console.log(`\nOrder ready for receipt generation!`);
      console.log(`Order ID: ${orderWithoutPayment.id}`);
      console.log(`Order Number: ${orderWithoutPayment.orderNumber}`);
    }
    
    console.log(`\nYou can now test the receipt generation in the admin panel.`);
    console.log(`The receipt button should appear for this order.`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestReceiptOrder();