const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    const email = 'admin@householdplanetkenya.co.ke';
    const password = 'Admin123!';
    const name = 'Admin User';

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists with email:', email);
      console.log('Current role:', existingAdmin.role);
      
      // Update role if not admin
      if (existingAdmin.role !== 'ADMIN' && existingAdmin.role !== 'SUPER_ADMIN') {
        await prisma.user.update({
          where: { email },
          data: { role: 'ADMIN' }
        });
        console.log('✅ Updated existing user to ADMIN role');
      }
      
      // Reset password
      const hashedPassword = await bcrypt.hash(password, 12);
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
      });
      console.log('✅ Password reset for admin user');
      console.log('Email:', email);
      console.log('Password:', password);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'ADMIN',
        isActive: true,
        emailVerified: true,
        phoneVerified: false
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Role:', adminUser.role);

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();