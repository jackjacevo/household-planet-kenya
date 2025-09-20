const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testLogin() {
  try {
    const email = 'admin@householdplanetkenya.co.ke';
    const password = 'Admin123!';

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found:');
    console.log('- Email:', user.email);
    console.log('- Role:', user.role);
    console.log('- Active:', user.isActive);
    console.log('- Email Verified:', user.emailVerified);

    // Test password
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('- Password valid:', isValidPassword);

    if (!isValidPassword) {
      console.log('❌ Password mismatch - resetting password...');
      
      const hashedPassword = await bcrypt.hash(password, 12);
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
      });
      
      console.log('✅ Password reset successfully');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();