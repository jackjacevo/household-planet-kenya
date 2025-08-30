const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSearchEndpoint() {
  try {
    // Test the exact query from the service
    const sanitizedQuery = '';
    const skip = 0;
    const limit = 20;
    
    const result = await prisma.user.findMany({
      where: {
        ...(sanitizedQuery && {
          OR: [
            { name: { contains: sanitizedQuery } },
            { email: { contains: sanitizedQuery } },
            { phone: { contains: sanitizedQuery } },
          ],
        }),
        role: 'CUSTOMER',
      },
      include: {
        customerProfile: {
          include: {
            tags: true,
          },
        },
        orders: {
          select: { id: true, total: true, status: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      skip,
      take: limit,
    });
    
    console.log('Search result:', result.length, 'customers found');
    result.forEach(customer => {
      console.log(`- ${customer.name} (${customer.email})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSearchEndpoint();