const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugJackSpark() {
  try {
    // Find Jack Spark
    const jackSpark = await prisma.user.findFirst({
      where: { name: 'Jack Spark' },
      include: {
        orders: {
          include: {
            items: {
              include: {
                product: { select: { name: true } }
              }
            }
          }
        },
        customerProfile: true
      }
    });

    if (!jackSpark) {
      console.log('Jack Spark not found');
      return;
    }

    console.log('Jack Spark User ID:', jackSpark.id);
    console.log('Jack Spark Email:', jackSpark.email);
    console.log('Jack Spark Orders:', jackSpark.orders.length);
    
    jackSpark.orders.forEach(order => {
      console.log(`Order ${order.id}: Status=${order.status}, Total=${order.total}, Items=${order.items.length}`);
    });

    console.log('\nCustomer Profile:', jackSpark.customerProfile);

    // Check if there are any orders with different userId
    const allOrders = await prisma.order.findMany({
      where: {
        OR: [
          { user: { name: 'Jack Spark' } },
          { user: { email: { contains: '0722650009' } } }
        ]
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: true
      }
    });

    console.log('\nAll orders related to Jack Spark:');
    allOrders.forEach(order => {
      console.log(`Order ${order.id}: User=${order.user.name} (${order.user.email}), Status=${order.status}, Total=${order.total}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugJackSpark();