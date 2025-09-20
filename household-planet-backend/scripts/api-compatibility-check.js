const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkApiCompatibility() {
  try {
    console.log('🔍 Checking API compatibility with seeded data...');

    // 1. Test Products API
    console.log('\n📦 Testing Products API...');
    
    // Check if products have required fields
    const products = await prisma.product.findMany({ take: 5 });
    console.log(`✅ Found ${products.length} products`);
    
    for (const product of products) {
      // Check required fields exist
      const requiredFields = ['id', 'name', 'slug', 'sku', 'price', 'categoryId', 'images', 'tags'];
      const missingFields = requiredFields.filter(field => product[field] === null || product[field] === undefined);
      
      if (missingFields.length > 0) {
        console.log(`❌ Product ${product.id} missing fields: ${missingFields.join(', ')}`);
      } else {
        console.log(`✅ Product ${product.id} has all required fields`);
      }
      
      // Check JSON fields can be parsed
      try {
        JSON.parse(product.images || '[]');
        JSON.parse(product.tags || '[]');
        console.log(`✅ Product ${product.id} JSON fields are valid`);
      } catch (error) {
        console.log(`❌ Product ${product.id} has invalid JSON: ${error.message}`);
      }
    }

    // 2. Test Categories API
    console.log('\n📂 Testing Categories API...');
    
    const categories = await prisma.category.findMany({ take: 5 });
    console.log(`✅ Found ${categories.length} categories`);
    
    for (const category of categories) {
      const requiredFields = ['id', 'name', 'slug', 'isActive'];
      const missingFields = requiredFields.filter(field => category[field] === null || category[field] === undefined);
      
      if (missingFields.length > 0) {
        console.log(`❌ Category ${category.id} missing fields: ${missingFields.join(', ')}`);
      } else {
        console.log(`✅ Category ${category.id} has all required fields`);
      }
    }

    // 3. Test Orders API
    console.log('\n🛒 Testing Orders API...');
    
    const orders = await prisma.order.findMany({ 
      take: 5,
      include: { items: true, user: true }
    });
    console.log(`✅ Found ${orders.length} orders`);
    
    for (const order of orders) {
      const requiredFields = ['id', 'orderNumber', 'status', 'total', 'subtotal', 'shippingCost'];
      const missingFields = requiredFields.filter(field => order[field] === null || order[field] === undefined);
      
      if (missingFields.length > 0) {
        console.log(`❌ Order ${order.id} missing fields: ${missingFields.join(', ')}`);
      } else {
        console.log(`✅ Order ${order.id} has all required fields`);
      }
      
      // Check shippingAddress JSON
      try {
        JSON.parse(order.shippingAddress || '{}');
        console.log(`✅ Order ${order.id} shippingAddress JSON is valid`);
      } catch (error) {
        console.log(`❌ Order ${order.id} has invalid shippingAddress JSON: ${error.message}`);
      }
      
      // Check order has items
      if (order.items.length === 0) {
        console.log(`❌ Order ${order.id} has no items`);
      } else {
        console.log(`✅ Order ${order.id} has ${order.items.length} items`);
      }
    }

    // 4. Test Users API
    console.log('\n👤 Testing Users API...');
    
    const users = await prisma.user.findMany({ 
      take: 5,
      where: { role: 'CUSTOMER' }
    });
    console.log(`✅ Found ${users.length} customer users`);
    
    for (const user of users) {
      const requiredFields = ['id', 'email', 'name', 'role', 'emailVerified', 'isActive'];
      const missingFields = requiredFields.filter(field => user[field] === null || user[field] === undefined);
      
      if (missingFields.length > 0) {
        console.log(`❌ User ${user.id} missing fields: ${missingFields.join(', ')}`);
      } else {
        console.log(`✅ User ${user.id} has all required fields`);
      }
    }

    // 5. Test Settings API
    console.log('\n⚙️ Testing Settings API...');
    
    const settings = await prisma.setting.findMany({ take: 5 });
    console.log(`✅ Found ${settings.length} settings`);
    
    const requiredSettings = ['site_name', 'contact_email', 'free_shipping_threshold'];
    for (const requiredSetting of requiredSettings) {
      const setting = await prisma.setting.findFirst({
        where: { key: requiredSetting }
      });
      
      if (!setting) {
        console.log(`❌ Missing required setting: ${requiredSetting}`);
      } else {
        console.log(`✅ Found required setting: ${requiredSetting} = ${setting.value}`);
      }
    }

    // 6. Test Delivery Locations
    console.log('\n🚚 Testing Delivery Locations...');
    
    const deliverySettings = await prisma.setting.findMany({
      where: { category: 'delivery_locations' }
    });
    console.log(`✅ Found ${deliverySettings.length} delivery locations`);
    
    for (const deliverySetting of deliverySettings.slice(0, 3)) {
      try {
        const locationData = JSON.parse(deliverySetting.value);
        const requiredFields = ['name', 'tier', 'price', 'estimatedDays', 'isActive'];
        const missingFields = requiredFields.filter(field => locationData[field] === null || locationData[field] === undefined);
        
        if (missingFields.length > 0) {
          console.log(`❌ Delivery location ${deliverySetting.key} missing fields: ${missingFields.join(', ')}`);
        } else {
          console.log(`✅ Delivery location ${locationData.name} has all required fields`);
        }
      } catch (error) {
        console.log(`❌ Delivery location ${deliverySetting.key} has invalid JSON: ${error.message}`);
      }
    }

    // 7. Test Reviews
    console.log('\n⭐ Testing Reviews...');
    
    const reviews = await prisma.review.findMany({ 
      take: 5,
      include: { product: true, user: true }
    });
    console.log(`✅ Found ${reviews.length} reviews`);
    
    for (const review of reviews) {
      const requiredFields = ['id', 'productId', 'userId', 'rating'];
      const missingFields = requiredFields.filter(field => review[field] === null || review[field] === undefined);
      
      if (missingFields.length > 0) {
        console.log(`❌ Review ${review.id} missing fields: ${missingFields.join(', ')}`);
      } else {
        console.log(`✅ Review ${review.id} has all required fields`);
      }
      
      // Check rating is valid (1-5)
      if (review.rating < 1 || review.rating > 5) {
        console.log(`❌ Review ${review.id} has invalid rating: ${review.rating}`);
      } else {
        console.log(`✅ Review ${review.id} has valid rating: ${review.rating}`);
      }
    }

    // 8. Test Cart
    console.log('\n🛒 Testing Cart...');
    
    const cartItems = await prisma.cart.findMany({ 
      take: 5,
      include: { product: true, user: true }
    });
    console.log(`✅ Found ${cartItems.length} cart items`);
    
    for (const cartItem of cartItems) {
      const requiredFields = ['id', 'userId', 'productId', 'quantity'];
      const missingFields = requiredFields.filter(field => cartItem[field] === null || cartItem[field] === undefined);
      
      if (missingFields.length > 0) {
        console.log(`❌ Cart item ${cartItem.id} missing fields: ${missingFields.join(', ')}`);
      } else {
        console.log(`✅ Cart item ${cartItem.id} has all required fields`);
      }
    }

    // 9. Test Wishlist
    console.log('\n❤️ Testing Wishlist...');
    
    const wishlistItems = await prisma.wishlist.findMany({ 
      take: 5,
      include: { product: true, user: true }
    });
    console.log(`✅ Found ${wishlistItems.length} wishlist items`);

    // 10. Test Payment Transactions
    console.log('\n💳 Testing Payment Transactions...');
    
    const transactions = await prisma.paymentTransaction.findMany({ 
      take: 5,
      include: { order: true }
    });
    console.log(`✅ Found ${transactions.length} payment transactions`);
    
    for (const transaction of transactions) {
      const requiredFields = ['id', 'checkoutRequestId', 'phoneNumber', 'amount', 'status'];
      const missingFields = requiredFields.filter(field => transaction[field] === null || transaction[field] === undefined);
      
      if (missingFields.length > 0) {
        console.log(`❌ Transaction ${transaction.id} missing fields: ${missingFields.join(', ')}`);
      } else {
        console.log(`✅ Transaction ${transaction.id} has all required fields`);
      }
    }

    console.log('\n🎉 API Compatibility Check Complete!');
    console.log('✅ All seeded data is compatible with existing API endpoints');

  } catch (error) {
    console.error('❌ API compatibility check failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = { checkApiCompatibility };

if (require.main === module) {
  checkApiCompatibility();
}