const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    const email = 'admin@householdplanet.co.ke';
    const password = 'Admin@2025';
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingAdmin) {
      console.log('❌ Admin user already exists');
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'SUPER_ADMIN',
        isActive: true,
        emailVerified: true,
        phone: '+254700000000'
      }
    });
    
    console.log('✅ Admin user created successfully');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Role:', admin.role);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();