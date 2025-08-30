const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugOrderItems() {
  try {
    // Check order 2 specifically
    const order = await prisma.order.findUnique({
      where: { id: 2 },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true } }
          }
        },
        user: { select: { name: true, email: true } }
      }
    });

    console.log('Order 2 details:', JSON.stringify(order, null, 2));

    // Check all order items
    const allOrderItems = await prisma.orderItem.findMany({
      where: { orderId: 2 },
      include: {
        product: { select: { id: true, name: true } }
      }
    });

    console.log('\nAll order items for order 2:', allOrderItems);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugOrderItems();