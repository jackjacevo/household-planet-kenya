const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupDuplicateUsers() {
  try {
    const users = await prisma.user.findMany({
      where: { email: 'householdplanet819@gmail.com' },
      orderBy: { id: 'asc' }
    });
    
    console.log('Found', users.length, 'users with this email:');
    users.forEach(user => {
      console.log(`ID: ${user.id}, Role: ${user.role}, Created: ${user.createdAt}`);
    });
    
    if (users.length > 1) {
      // Keep the SUPER_ADMIN one, delete others
      const superAdminUser = users.find(u => u.role === 'SUPER_ADMIN');
      const usersToDelete = users.filter(u => u.id !== superAdminUser?.id);
      
      for (const user of usersToDelete) {
        await prisma.user.delete({ where: { id: user.id } });
        console.log(`Deleted user ID: ${user.id} (Role: ${user.role})`);
      }
      
      console.log('✅ Cleanup complete. Only SUPER_ADMIN user remains.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicateUsers();