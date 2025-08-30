const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestOrder() {
  try {
    console.log('🔧 Creating test order with WhatsApp format...');

    // First, check if we have any users
    const users = await prisma.user.findMany({ take: 1 });
    if (users.length === 0) {
      console.log('❌ No users found. Creating a test user first...');
      
      const testUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test Customer',
          password: 'hashedpassword123',
          phone: '254712345678',
          role: 'CUSTOMER'
        }
      });
      console.log('✅ Test user created:', testUser.email);
    }

    const user = users[0] || await prisma.user.findFirst();

    // Check if we have any products
    const products = await prisma.product.findMany({ take: 1 });
    if (products.length === 0) {
      console.log('❌ No products found. Please run the product seeding first.');
      return;
    }

    const product = products[0];

    // Create a test order with WhatsApp-style order number
    const testOrder = await prisma.order.create({
      data: {
        userId: user.id,
        orderNumber: 'WA-1756163997824-4200',
        status: 'PENDING',
        subtotal: 4000,
        shippingCost: 200,
        total: 4200,
        shippingAddress: JSON.stringify({
          fullName: 'Test Customer',
          phone: '254712345678',
          street: 'Test Street',
          town: 'Nairobi',
          county: 'Nairobi'
        }),
        deliveryLocation: 'Nairobi CBD',
        paymentMethod: 'CASH',
        paymentStatus: 'PENDING',
        source: 'WHATSAPP',
        items: {
          create: [{
            productId: product.id,
            quantity: 2,
            price: 2000,
            total: 4000
          }]
        }
      },
      include: {
        items: true,
        user: true
      }
    });

    console.log('✅ Test order created successfully:');
    console.log('   Order Number:', testOrder.orderNumber);
    console.log('   Order ID:', testOrder.id);
    console.log('   Total:', testOrder.total);
    console.log('   Customer:', testOrder.user.name);
    console.log('   Items:', testOrder.items.length);

    // Create another test order with different format
    const testOrder2 = await prisma.order.create({
      data: {
        userId: user.id,
        orderNumber: 'HP-20241201-143022-A1B2',
        status: 'PENDING',
        subtotal: 2500,
        shippingCost: 0,
        total: 2500,
        shippingAddress: JSON.stringify({
          fullName: 'Test Customer 2',
          phone: '254798765432',
          street: 'Another Street',
          town: 'Mombasa',
          county: 'Mombasa'
        }),
        deliveryLocation: 'Mombasa Town',
        paymentMethod: 'MPESA',
        paymentStatus: 'PENDING',
        source: 'WEB',
        items: {
          create: [{
            productId: product.id,
            quantity: 1,
            price: 2500,
            total: 2500
          }]
        }
      }
    });

    console.log('\n✅ Second test order created:');
    console.log('   Order Number:', testOrder2.orderNumber);
    console.log('   Order ID:', testOrder2.id);
    console.log('   Total:', testOrder2.total);

    console.log('\n🎉 Test orders ready for manual payment testing!');
    console.log('\nYou can now test with:');
    console.log('- Order Number: WA-1756163997824-4200 (Amount: 4200)');
    console.log('- Order Number: HP-20241201-143022-A1B2 (Amount: 2500)');
    console.log(`- Numeric Order ID: ${testOrder.id} or ${testOrder2.id}`);

  } catch (error) {
    console.error('❌ Error creating test order:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestOrder();