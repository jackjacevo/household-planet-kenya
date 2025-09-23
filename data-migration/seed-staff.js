const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const staffAccounts = [
  {
    email: 'admin@householdplanetkenya.co.ke',
    password: 'Admin123!@#',
    name: 'System Administrator',
    role: 'ADMIN',
    phone: '+254700000001'
  },
  {
    email: 'manager@householdplanetkenya.co.ke',
    password: 'Manager123!@#',
    name: 'Store Manager',
    role: 'MANAGER',
    phone: '+254700000002'
  },
  {
    email: 'support@householdplanetkenya.co.ke',
    password: 'Support123!@#',
    name: 'Customer Support',
    role: 'SUPPORT',
    phone: '+254700000003'
  }
];

const testCustomers = [
  {
    email: 'test.customer1@example.com',
    password: 'Test123!@#',
    name: 'Test Customer One',
    phone: '+254700000101',
    address: 'Nairobi CBD, Kenya'
  },
  {
    email: 'test.customer2@example.com',
    password: 'Test123!@#',
    name: 'Test Customer Two',
    phone: '+254700000102',
    address: 'Westlands, Nairobi'
  }
];

async function seedStaff() {
  console.log('👥 Creating staff accounts...');

  for (const staff of staffAccounts) {
    const hashedPassword = await bcrypt.hash(staff.password, 10);
    
    await prisma.user.upsert({
      where: { email: staff.email },
      update: {},
      create: {
        email: staff.email,
        password: hashedPassword,
        name: staff.name,
        role: staff.role,
        phone: staff.phone,
        isActive: true
      }
    });
  }

  for (const customer of testCustomers) {
    const hashedPassword = await bcrypt.hash(customer.password, 10);
    
    await prisma.user.upsert({
      where: { email: customer.email },
      update: {},
      create: {
        email: customer.email,
        password: hashedPassword,
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        role: 'CUSTOMER',
        isActive: true
      }
    });
  }

  console.log('✅ Staff and test accounts created');
}

seedStaff()
  .catch(console.error)
  .finally(() => prisma.$disconnect());