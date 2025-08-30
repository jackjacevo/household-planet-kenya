const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateAllCustomerStats() {
  try {
    console.log('Starting customer stats update...');
    
    // Get all customers
    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: { id: true, name: true, email: true }
    });

    console.log(`Found ${customers.length} customers to update`);

    for (const customer of customers) {
      console.log(`Updating stats for ${customer.name} (${customer.email})`);
      
      // Get delivered orders for this customer
      const orders = await prisma.order.findMany({
        where: { 
          userId: customer.id, 
          status: 'DELIVERED' 
        },
        select: { total: true, createdAt: true }
      });

      const totalSpent = orders.reduce((sum, order) => sum + Number(order.total), 0);
      const totalOrders = orders.length;
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
      const lastOrderDate = orders.length > 0 ? orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0].createdAt : null;

      // Update or create customer profile
      await prisma.customerProfile.upsert({
        where: { userId: customer.id },
        update: {
          totalSpent,
          totalOrders,
          averageOrderValue,
          lastOrderDate,
        },
        create: {
          userId: customer.id,
          totalSpent,
          totalOrders,
          averageOrderValue,
          lastOrderDate,
        },
      });

      console.log(`  - Orders: ${totalOrders}, Spent: KSh ${totalSpent.toLocaleString()}`);
    }

    console.log('Customer stats update completed!');
    
  } catch (error) {
    console.error('Error updating customer stats:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAllCustomerStats();