const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedSampleOrders() {
  try {
    console.log('🌱 Seeding sample customers and orders...');
    
    // Check if customers already exist
    const existingCustomers = await prisma.user.count({ where: { role: 'CUSTOMER' } });
    console.log('ℹ️  Existing customers:', existingCustomers);
    
    // Get products for orders
    const products = await prisma.product.findMany({ take: 5 });
    if (products.length === 0) {
      console.log('❌ No products found. Please seed products first.');
      return;
    }
    
    console.log('✅ Found products:', products.length);
    
    // Create sample customers if none exist
    let customers = [];
    if (existingCustomers === 0) {
      console.log('👥 Creating sample customers...');
      
      const sampleCustomers = [
        {
          name: 'John Doe',
          email: 'john.doe@example.com',
          password: await bcrypt.hash('password123', 10),
          role: 'CUSTOMER',
          phone: '+254700123456',
          isActive: true
        },
        {
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          password: await bcrypt.hash('password123', 10),
          role: 'CUSTOMER',
          phone: '+254700123457',
          isActive: true
        },
        {
          name: 'Mike Johnson',
          email: 'mike.johnson@example.com',
          password: await bcrypt.hash('password123', 10),
          role: 'CUSTOMER',
          phone: '+254700123458',
          isActive: true
        }
      ];
      
      for (const customerData of sampleCustomers) {
        const customer = await prisma.user.create({ data: customerData });
        customers.push(customer);
        console.log(`✅ Created customer: ${customer.name}`);
      }
    } else {
      customers = await prisma.user.findMany({ 
        where: { role: 'CUSTOMER' },
        take: 3
      });
      console.log('✅ Using existing customers:', customers.length);
    }
    
    // Check if orders already exist
    const existingOrders = await prisma.order.count();
    console.log('ℹ️  Existing orders:', existingOrders);
    
    if (existingOrders > 0) {
      console.log('✅ Orders already exist, skipping order creation');
      return;
    }
    
    console.log('📋 Creating sample orders...');
    
    // Create sample orders
    const sampleOrders = [
      {
        userId: customers[0].id,
        orderNumber: 'ORD-001',
        total: 4300,
        status: 'DELIVERED',
        deliveryLocation: 'Nairobi',
        deliveryCost: 300,
        paymentMethod: 'MPESA',
        paymentStatus: 'PAID',
        items: [
          { productId: products[0].id, quantity: 1, price: products[0].price },
          { productId: products[1].id, quantity: 2, price: products[1].price }
        ]
      },
      {
        userId: customers[1].id,
        orderNumber: 'ORD-002',
        total: 2500,
        status: 'PENDING',
        deliveryLocation: 'Mombasa',
        deliveryCost: 500,
        paymentMethod: 'MPESA',
        paymentStatus: 'PENDING',
        items: [
          { productId: products[2].id, quantity: 1, price: products[2].price },
          { productId: products[3].id, quantity: 1, price: products[3].price }
        ]
      },
      {
        userId: customers[2].id,
        orderNumber: 'ORD-003',
        total: 1800,
        status: 'DELIVERED',
        deliveryLocation: 'Kisumu',
        deliveryCost: 400,
        paymentMethod: 'CASH',
        paymentStatus: 'PAID',
        items: [
          { productId: products[1].id, quantity: 1, price: products[1].price }
        ]
      }
    ];
    
    for (const orderData of sampleOrders) {
      const { items, ...orderInfo } = orderData;
      
      const order = await prisma.order.create({
        data: {
          ...orderInfo,
          items: {
            create: items
          }
        }
      });
      
      console.log(`✅ Created order: ${order.orderNumber} - KSh ${order.total}`);
    }
    
    console.log('🎉 Sample customers and orders seeded successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding orders:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedSampleOrders();