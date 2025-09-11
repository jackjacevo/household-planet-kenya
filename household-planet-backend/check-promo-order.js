const { PrismaClient } = require('@prisma/client');

async function checkPromoOrder() {
  const prisma = new PrismaClient();
  
  try {
    // Check the specific order that's failing
    const order = await prisma.order.findUnique({
      where: { id: 32 },
      include: {
        user: true,
        items: true,
        paymentTransactions: true
      }
    });
    
    if (order) {
      console.log('Order 32 details:');
      console.log('- Order Number:', order.orderNumber);
      console.log('- Status:', order.status);
      console.log('- Payment Status:', order.paymentStatus);
      console.log('- Subtotal:', order.subtotal);
      console.log('- Discount Amount:', order.discountAmount);
      console.log('- Promo Code:', order.promoCode);
      console.log('- Shipping Cost:', order.shippingCost);
      console.log('- Total:', order.total);
      console.log('- Items:', order.items.length);
      console.log('- Payment Transactions:', order.paymentTransactions.length);
      
      if (order.paymentTransactions.length > 0) {
        order.paymentTransactions.forEach((payment, index) => {
          console.log(`  Payment ${index + 1}: ${payment.status} - KSh ${payment.amount}`);
        });
      }
    } else {
      console.log('Order 32 not found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPromoOrder();