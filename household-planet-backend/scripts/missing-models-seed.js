const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedMissingModels() {
  try {
    console.log('🔍 Seeding missing Prisma models...');

    // Get existing users for relationships
    const admin = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
    const customers = await prisma.user.findMany({ where: { role: 'CUSTOMER' } });
    const products = await prisma.product.findMany();
    const orders = await prisma.order.findMany();

    if (!admin || customers.length === 0 || products.length === 0) {
      console.log('❌ Base data not found. Run main seeding first.');
      return;
    }

    // 1. Customer Profiles
    for (const customer of customers) {
      const existingProfile = await prisma.customerProfile.findUnique({
        where: { userId: customer.id }
      });
      
      if (!existingProfile) {
        await prisma.customerProfile.create({
          data: {
            userId: customer.id,
            loyaltyPoints: Math.floor(Math.random() * 500),
            totalSpent: Math.floor(Math.random() * 10000) + 1000,
            totalOrders: Math.floor(Math.random() * 10) + 1,
            averageOrderValue: Math.floor(Math.random() * 2000) + 500,
            lastOrderDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            preferredCategories: JSON.stringify(['kitchen-dining', 'home-appliances']),
            communicationPreferences: JSON.stringify({ email: true, sms: false, whatsapp: true })
          }
        });
      }
    }

    // 2. Addresses
    for (const customer of customers) {
      const existingAddress = await prisma.address.findFirst({
        where: { userId: customer.id }
      });
      
      if (!existingAddress) {
        await prisma.address.create({
          data: {
            userId: customer.id,
            type: 'HOME',
            fullName: customer.name,
            phone: `+25471${Math.floor(Math.random() * 9000000) + 1000000}`,
            county: ['Nairobi', 'Mombasa', 'Kisumu'][Math.floor(Math.random() * 3)],
            town: ['CBD', 'Westlands', 'Karen'][Math.floor(Math.random() * 3)],
            street: `${Math.floor(Math.random() * 999) + 1} Main Street`,
            isDefault: true
          }
        });
      }
    }

    // 3. Reviews
    for (let i = 0; i < 10; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const product = products[Math.floor(Math.random() * products.length)];
      
      const existingReview = await prisma.review.findUnique({
        where: { productId_userId: { productId: product.id, userId: customer.id } }
      });
      
      if (!existingReview) {
        await prisma.review.create({
          data: {
            productId: product.id,
            userId: customer.id,
            rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
            title: 'Great product!',
            comment: 'Excellent quality and fast delivery. Highly recommended!',
            isVerified: true,
            isHelpful: Math.floor(Math.random() * 10)
          }
        });
      }
    }

    // 4. Wishlist items
    for (const customer of customers) {
      const product = products[Math.floor(Math.random() * products.length)];
      
      const existingWishlist = await prisma.wishlist.findUnique({
        where: { userId_productId: { userId: customer.id, productId: product.id } }
      });
      
      if (!existingWishlist) {
        await prisma.wishlist.create({
          data: {
            userId: customer.id,
            productId: product.id
          }
        });
      }
    }

    // 5. Cart items
    for (const customer of customers) {
      const product = products[Math.floor(Math.random() * products.length)];
      
      const existingCart = await prisma.cart.findFirst({
        where: { userId: customer.id, productId: product.id, variantId: null }
      });
      
      if (!existingCart) {
        await prisma.cart.create({
          data: {
            userId: customer.id,
            productId: product.id,
            quantity: Math.floor(Math.random() * 3) + 1
          }
        });
      }
    }

    // 6. Payment Transactions
    for (const order of orders.slice(0, 5)) {
      const existingTransaction = await prisma.paymentTransaction.findFirst({
        where: { orderId: order.id }
      });
      
      if (!existingTransaction) {
        await prisma.paymentTransaction.create({
          data: {
            orderId: order.id,
            checkoutRequestId: `ws_CO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            phoneNumber: '+254712345678',
            amount: order.total,
            status: 'SUCCESS',
            provider: 'MPESA',
            paymentType: 'STK_PUSH',
            mpesaReceiptNumber: `NLJ7RT61SV`,
            transactionDate: order.createdAt,
            resultCode: '0',
            resultDescription: 'The service request is processed successfully.'
          }
        });
      }
    }

    // 7. Recently Viewed
    for (const customer of customers) {
      for (let i = 0; i < 3; i++) {
        const product = products[Math.floor(Math.random() * products.length)];
        
        const existingView = await prisma.recentlyViewed.findUnique({
          where: { userId_productId: { userId: customer.id, productId: product.id } }
        });
        
        if (!existingView) {
          await prisma.recentlyViewed.create({
            data: {
              userId: customer.id,
              productId: product.id,
              viewedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
            }
          });
        }
      }
    }

    // 8. Search Queries
    const searchQueries = [
      'kitchen utensils', 'bathroom towels', 'cleaning supplies', 'electric kettle',
      'non-stick pan', 'storage containers', 'home decor', 'appliances'
    ];
    
    for (const query of searchQueries) {
      await prisma.searchQuery.create({
        data: {
          query,
          userId: customers[Math.floor(Math.random() * customers.length)].id,
          resultCount: Math.floor(Math.random() * 20) + 5,
          timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        }
      });
    }

    // 9. Analytics Events
    const events = ['page_view', 'product_view', 'add_to_cart', 'purchase', 'search'];
    
    for (let i = 0; i < 50; i++) {
      await prisma.analyticsEvent.create({
        data: {
          event: events[Math.floor(Math.random() * events.length)],
          properties: JSON.stringify({
            page: '/products',
            product_id: products[Math.floor(Math.random() * products.length)].id,
            category: 'kitchen-dining'
          }),
          userId: customers[Math.floor(Math.random() * customers.length)].id.toString(),
          sessionId: `session_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          pageUrl: 'https://householdplanetkenya.co.ke/products'
        }
      });
    }

    // 10. WhatsApp Messages
    const whatsappMessages = [
      'Hi, I want to order kitchen utensils',
      'Do you have electric kettles in stock?',
      'What is the price of the Samsung frying pan?',
      'Can you deliver to Mombasa?'
    ];
    
    for (const message of whatsappMessages) {
      await prisma.whatsAppMessage.create({
        data: {
          phoneNumber: `+25471${Math.floor(Math.random() * 9000000) + 1000000}`,
          message,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          messageId: `msg_${Math.random().toString(36).substr(2, 9)}`,
          isOrderCandidate: Math.random() > 0.5,
          processed: Math.random() > 0.3
        }
      });
    }

    // 11. User Sessions
    for (const customer of customers) {
      await prisma.userSession.create({
        data: {
          userId: customer.id,
          token: `token_${Math.random().toString(36).substr(2, 32)}`,
          refreshToken: `refresh_${Math.random().toString(36).substr(2, 32)}`,
          deviceInfo: 'Chrome on Windows',
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          isActive: true,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          lastUsedAt: new Date()
        }
      });
    }

    // 12. Login Attempts
    for (let i = 0; i < 10; i++) {
      await prisma.loginAttempt.create({
        data: {
          email: customers[Math.floor(Math.random() * customers.length)].email,
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          success: Math.random() > 0.2,
          failureReason: Math.random() > 0.8 ? 'Invalid password' : null,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        }
      });
    }

    console.log('✅ Missing models seeding completed!');
    console.log('📊 Added:');
    console.log('- Customer profiles with loyalty points');
    console.log('- Customer addresses');
    console.log('- Product reviews and ratings');
    console.log('- Wishlist items');
    console.log('- Shopping cart items');
    console.log('- Payment transactions');
    console.log('- Recently viewed products');
    console.log('- Search queries');
    console.log('- Analytics events');
    console.log('- WhatsApp messages');
    console.log('- User sessions');
    console.log('- Login attempts');

  } catch (error) {
    console.error('❌ Missing models seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = { seedMissingModels };

if (require.main === module) {
  seedMissingModels();
}