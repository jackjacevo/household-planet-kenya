const { PrismaClient } = require('@prisma/client');

async function checkOrderItems() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Checking order items...\n');
    
    // Check if there are any order items at all
    const totalOrderItems = await prisma.orderItem.count();
    console.log(`Total order items in database: ${totalOrderItems}`);
    
    // Check orders with items
    const ordersWithItems = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: { select: { name: true } }
          }
        }
      },
      where: {
        items: {
          some: {}
        }
      },
      take: 3
    });
    
    console.log(`\nOrders with items: ${ordersWithItems.length}`);
    
    ordersWithItems.forEach((order, index) => {
      console.log(`\nOrder ${index + 1}: ${order.orderNumber}`);
      console.log(`Items: ${order.items.length}`);
      order.items.forEach((item, itemIndex) => {
        console.log(`  Item ${itemIndex + 1}: ${item.product?.name || 'Unknown'} - Qty: ${item.quantity} - Price: KSh ${item.price}`);
      });
    });
    
    // Let's create some test order items for order ID 3 (which has completed payment)
    const testOrderId = 3;
    const testOrder = await prisma.order.findUnique({
      where: { id: testOrderId },
      include: { items: true }
    });
    
    if (testOrder && testOrder.items.length === 0) {
      console.log(`\nCreating test items for order ${testOrder.orderNumber}...`);
      
      // Find some products to add as items
      const products = await prisma.product.findMany({ take: 2 });
      
      if (products.length > 0) {
        for (const product of products) {
          await prisma.orderItem.create({
            data: {
              orderId: testOrderId,
              productId: product.id,
              quantity: 1,
              price: product.price,
              total: product.price
            }
          });
          console.log(`Added item: ${product.name} - KSh ${product.price}`);
        }
        
        console.log(`Test items created for order ${testOrder.orderNumber}`);
      } else {
        console.log('No products found to create test items');
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrderItems();