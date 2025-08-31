const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedAdminActivities() {
  try {
    console.log('🌱 Seeding admin activities...');

    // Get admin users
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' }
    });

    if (adminUsers.length === 0) {
      console.log('❌ No admin users found. Please create admin users first.');
      return;
    }

    const sampleActivities = [
      {
        action: 'LOGIN',
        details: { message: 'Admin logged in successfully' },
        entityType: null,
        entityId: null
      },
      {
        action: 'CREATE_PRODUCT',
        details: { productName: 'Sample Product', sku: 'SP001' },
        entityType: 'Product',
        entityId: 1
      },
      {
        action: 'UPDATE_ORDER',
        details: { orderNumber: 'ORD-001', status: 'PROCESSING' },
        entityType: 'Order',
        entityId: 1
      },
      {
        action: 'DELETE_CATEGORY',
        details: { categoryName: 'Old Category' },
        entityType: 'Category',
        entityId: 5
      },
      {
        action: 'VIEW_DASHBOARD',
        details: { section: 'main_dashboard' },
        entityType: null,
        entityId: null
      },
      {
        action: 'UPDATE_CUSTOMER',
        details: { customerId: 123, field: 'email' },
        entityType: 'User',
        entityId: 123
      },
      {
        action: 'CREATE_CATEGORY',
        details: { categoryName: 'New Electronics', slug: 'new-electronics' },
        entityType: 'Category',
        entityId: 10
      },
      {
        action: 'UPDATE_PRODUCT',
        details: { productId: 5, field: 'price', oldValue: 1000, newValue: 1200 },
        entityType: 'Product',
        entityId: 5
      }
    ];

    // Create activities for each admin user
    for (const admin of adminUsers) {
      for (let i = 0; i < sampleActivities.length; i++) {
        const activity = sampleActivities[i];
        const createdAt = new Date(Date.now() - (i * 60 * 60 * 1000)); // Spread over hours

        await prisma.adminActivity.create({
          data: {
            userId: admin.id,
            action: activity.action,
            details: JSON.stringify(activity.details),
            entityType: activity.entityType,
            entityId: activity.entityId,
            ipAddress: '127.0.0.1',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            createdAt
          }
        });
      }
    }

    const totalActivities = await prisma.adminActivity.count();
    console.log(`✅ Successfully seeded ${totalActivities} admin activities`);

  } catch (error) {
    console.error('❌ Error seeding admin activities:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdminActivities();