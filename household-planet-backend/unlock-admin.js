const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function unlockAdmin() {
  try {
    await prisma.user.update({
      where: { email: 'admin@householdplanetkenya.co.ke' },
      data: {
        loginAttempts: 0,
        lockedUntil: null
      }
    });
    
    console.log('✅ Admin account unlocked');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

unlockAdmin();