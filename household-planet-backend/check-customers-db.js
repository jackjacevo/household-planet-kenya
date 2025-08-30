const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCustomers() {
  try {
    // Check all users
    const allUsers = await prisma.user.findMany();
    console.log('Total users:', allUsers.length);
    
    // Check customers specifically
    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      include: {
        customerProfile: true,
        orders: true
      }
    });
    
    console.log('\nCustomers found:', customers.length);
    
    if (customers.length > 0) {
      console.log('\nCustomer details:');
      customers.forEach(customer => {
        console.log(`- ${customer.name} (${customer.email}) - Role: ${customer.role}`);
      });
    } else {
      console.log('\nNo customers found in database.');
      console.log('\nAll users by role:');
      const usersByRole = {};
      allUsers.forEach(user => {
        usersByRole[user.role] = (usersByRole[user.role] || 0) + 1;
      });
      console.log(usersByRole);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCustomers();