const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetAndSeed() {
  try {
    console.log('🗑️ Clearing existing data...');

    // Clear data in correct order (respecting foreign key constraints)
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({});

    console.log('✅ Data cleared successfully');
    console.log('🌱 Starting fresh seeding...');

    // Create admin user with proper role
    const adminPassword = await bcrypt.hash('Admin@2025', 12);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@householdplanet.co.ke',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        name: 'Admin User',
        role: 'SUPER_ADMIN',
        emailVerified: true,
        isActive: true,
        permissions: JSON.stringify(['admin:read', 'admin:write', 'admin:delete', 'orders:read', 'orders:write'])
      }
    });

    // Create categories
    const categories = [
      { name: 'Kitchen and Dining', slug: 'kitchen-dining', description: 'Cookware, Utensils, Dinnerware, Appliances, Storage', isActive: true },
      { name: 'Bathroom Accessories', slug: 'bathroom-accessories', description: 'Towels, Mats, Organizers, Fixtures, Decor', isActive: true },
      { name: 'Cleaning and Laundry', slug: 'cleaning-laundry', description: 'Cleaning Supplies, Tools, Laundry Accessories', isActive: true },
      { name: 'Beddings and Bedroom Accessories', slug: 'beddings-bedroom', description: 'Sheets, Comforters, Pillows, Mattress Protectors', isActive: true },
      { name: 'Storage and Organization', slug: 'storage-organization', description: 'Containers, Shelving, Closet Organizers, Baskets', isActive: true },
      { name: 'Home Decor and Accessories', slug: 'home-decor', description: 'Wall Art, Decorative Items, Rugs, Curtains', isActive: true },
      { name: 'Jewelry', slug: 'jewelry', description: 'Fashion Jewelry, Jewelry Boxes, Accessories', isActive: true },
      { name: 'Humidifier, Candles and Aromatherapy', slug: 'aromatherapy', description: 'Essential Oils, Diffusers, Scented Candles', isActive: true },
      { name: 'Beauty and Cosmetics', slug: 'beauty-cosmetics', description: 'Skincare, Makeup, Tools, Mirrors', isActive: true },
      { name: 'Home Appliances', slug: 'home-appliances', description: 'Small Appliances, Kitchen Gadgets, Electronics', isActive: true },
      { name: 'Furniture', slug: 'furniture', description: 'Living Room, Bedroom, Dining, Office Furniture', isActive: true },
      { name: 'Outdoor and Garden', slug: 'outdoor-garden', description: 'Patio Furniture, Garden Tools, Planters', isActive: true },
      { name: 'Lighting and Electrical', slug: 'lighting-electrical', description: 'Lamps, Fixtures, Bulbs, Extension Cords', isActive: true },
      { name: 'Bags and Belts', slug: 'bags-belts', description: 'Handbags, Backpacks, Belts, Accessories', isActive: true }
    ];

    const createdCategories = [];
    for (const category of categories) {
      const created = await prisma.category.create({ data: category });
      createdCategories.push(created);
    }

    // Create comprehensive products with images
    const products = [
      // Kitchen & Dining
      { name: 'Non-Stick Frying Pan Set', slug: 'non-stick-frying-pan-set', sku: 'KIT-PAN-001', description: '3-piece non-stick frying pan set with ergonomic handles', price: 2500, comparePrice: 3000, categoryId: createdCategories[0].id, stock: 50, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500']), tags: JSON.stringify(['kitchen', 'cookware', 'non-stick']) },
      { name: 'Stainless Steel Cookware Set', slug: 'stainless-steel-cookware-set', sku: 'KIT-COO-002', description: '7-piece stainless steel cookware set with glass lids', price: 4500, comparePrice: 5500, categoryId: createdCategories[0].id, stock: 30, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1584990347498-7895d9d6e2d8?w=500']), tags: JSON.stringify(['kitchen', 'cookware', 'stainless-steel']) },
      { name: 'Ceramic Dinnerware Set', slug: 'ceramic-dinnerware-set', sku: 'KIT-DIN-003', description: '16-piece ceramic dinnerware set for 4 people', price: 3200, comparePrice: 4000, categoryId: createdCategories[0].id, stock: 25, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500']), tags: JSON.stringify(['kitchen', 'dinnerware', 'ceramic']) },
      
      // Bathroom Accessories
      { name: 'Cotton Bath Towel Set', slug: 'cotton-bath-towel-set', sku: 'BAT-TOW-004', description: '6-piece premium cotton bath towel set', price: 1800, comparePrice: 2200, categoryId: createdCategories[1].id, stock: 40, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=500']), tags: JSON.stringify(['bathroom', 'towels', 'cotton']) },
      { name: 'Bamboo Bathroom Organizer', slug: 'bamboo-bathroom-organizer', sku: 'BAT-ORG-005', description: 'Eco-friendly bamboo bathroom storage organizer', price: 1200, comparePrice: 1500, categoryId: createdCategories[1].id, stock: 35, isFeatured: false, images: JSON.stringify(['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500']), tags: JSON.stringify(['bathroom', 'organizer', 'bamboo']) },
      
      // Cleaning & Laundry
      { name: 'All-Purpose Cleaner 500ml', slug: 'all-purpose-cleaner-500ml', sku: 'CLN-APC-006', description: 'Multi-surface cleaning solution with fresh scent', price: 350, comparePrice: 450, categoryId: createdCategories[2].id, stock: 100, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500']), tags: JSON.stringify(['cleaning', 'multi-purpose']) },
      { name: 'Microfiber Cleaning Cloths', slug: 'microfiber-cleaning-cloths', sku: 'CLN-MIC-007', description: 'Pack of 12 microfiber cleaning cloths', price: 800, comparePrice: 1000, categoryId: createdCategories[2].id, stock: 60, isFeatured: false, images: JSON.stringify(['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500']), tags: JSON.stringify(['cleaning', 'microfiber']) },
      
      // Beddings & Bedroom
      { name: 'Cotton Bed Sheet Set', slug: 'cotton-bed-sheet-set', sku: 'BED-SHE-008', description: 'Queen size 100% cotton bed sheet set', price: 2200, comparePrice: 2800, categoryId: createdCategories[3].id, stock: 35, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500']), tags: JSON.stringify(['bedding', 'cotton', 'sheets']) },
      { name: 'Memory Foam Pillow', slug: 'memory-foam-pillow', sku: 'BED-PIL-009', description: 'Ergonomic memory foam pillow with cooling gel', price: 1500, comparePrice: 1800, categoryId: createdCategories[3].id, stock: 45, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500']), tags: JSON.stringify(['bedding', 'pillow', 'memory-foam']) },
      
      // Storage & Organization
      { name: 'Storage Basket Set', slug: 'storage-basket-set', sku: 'STO-BAS-010', description: '3-piece woven storage basket set with handles', price: 1200, comparePrice: 1500, categoryId: createdCategories[4].id, stock: 30, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500']), tags: JSON.stringify(['storage', 'baskets', 'organization']) },
      { name: 'Plastic Storage Containers', slug: 'plastic-storage-containers', sku: 'STO-CON-011', description: 'Set of 10 airtight plastic storage containers', price: 1800, comparePrice: 2200, categoryId: createdCategories[4].id, stock: 40, isFeatured: false, images: JSON.stringify(['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500']), tags: JSON.stringify(['storage', 'containers', 'plastic']) },
      
      // Home Decor
      { name: 'Decorative Wall Mirror', slug: 'decorative-wall-mirror', sku: 'DEC-MIR-012', description: 'Round decorative wall mirror with gold frame', price: 2800, comparePrice: 3500, categoryId: createdCategories[5].id, stock: 20, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500']), tags: JSON.stringify(['decor', 'mirror', 'wall-art']) },
      { name: 'Artificial Plant Set', slug: 'artificial-plant-set', sku: 'DEC-PLA-013', description: 'Set of 3 realistic artificial plants in pots', price: 1600, comparePrice: 2000, categoryId: createdCategories[5].id, stock: 25, isFeatured: false, images: JSON.stringify(['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500']), tags: JSON.stringify(['decor', 'plants', 'artificial']) },
      
      // Beauty & Cosmetics
      { name: 'Skincare Gift Set', slug: 'skincare-gift-set', sku: 'BEA-SKI-014', description: 'Complete skincare routine set with cleanser, toner, and moisturizer', price: 3500, comparePrice: 4200, categoryId: createdCategories[8].id, stock: 25, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=500']), tags: JSON.stringify(['beauty', 'skincare', 'gift-set']) },
      { name: 'Makeup Brush Set', slug: 'makeup-brush-set', sku: 'BEA-BRU-015', description: 'Professional 12-piece makeup brush set with case', price: 2200, comparePrice: 2800, categoryId: createdCategories[8].id, stock: 30, isFeatured: false, images: JSON.stringify(['https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=500']), tags: JSON.stringify(['beauty', 'makeup', 'brushes']) },
      
      // Home Appliances
      { name: 'Electric Kettle 1.7L', slug: 'electric-kettle-17l', sku: 'APP-KET-016', description: 'Stainless steel electric kettle with auto shut-off', price: 2200, comparePrice: 2800, categoryId: createdCategories[9].id, stock: 35, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500']), tags: JSON.stringify(['appliances', 'kettle', 'electric']) },
      { name: 'Coffee Maker', slug: 'coffee-maker', sku: 'APP-COF-017', description: '12-cup programmable coffee maker with timer', price: 4500, comparePrice: 5500, categoryId: createdCategories[9].id, stock: 20, isFeatured: true, images: JSON.stringify(['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500']), tags: JSON.stringify(['appliances', 'coffee', 'maker']) }
    ];

    const createdProducts = [];
    for (const product of products) {
      const created = await prisma.product.create({ data: product });
      createdProducts.push(created);
    }

    // Create sample customers
    const customers = [
      { email: 'customer1@example.com', firstName: 'John', lastName: 'Doe', name: 'John Doe', role: 'CUSTOMER', emailVerified: true, isActive: true },
      { email: 'customer2@example.com', firstName: 'Jane', lastName: 'Smith', name: 'Jane Smith', role: 'CUSTOMER', emailVerified: true, isActive: true },
      { email: 'customer3@example.com', firstName: 'Mike', lastName: 'Johnson', name: 'Mike Johnson', role: 'CUSTOMER', emailVerified: true, isActive: true }
    ];

    const createdCustomers = [];
    for (const customer of customers) {
      const password = await bcrypt.hash('password123', 12);
      const created = await prisma.user.create({
        data: { ...customer, password }
      });
      createdCustomers.push(created);
    }

    // Create sample orders
    const orders = [
      {
        userId: createdCustomers[0].id,
        orderNumber: 'HP' + Date.now() + '001',
        status: 'COMPLETED',
        total: 5200,
        subtotal: 4500,
        shippingCost: 0,
        paymentMethod: 'M_PESA',
        paymentStatus: 'PAID',
        shippingAddress: JSON.stringify({
          firstName: 'John',
          lastName: 'Doe',
          phone: '+254712345678',
          address: '123 Main St',
          city: 'Nairobi',
          county: 'Nairobi'
        })
      },
      {
        userId: createdCustomers[1].id,
        orderNumber: 'HP' + Date.now() + '002',
        status: 'PROCESSING',
        total: 3800,
        subtotal: 3200,
        shippingCost: 0,
        paymentMethod: 'CARD',
        paymentStatus: 'PAID',
        shippingAddress: JSON.stringify({
          firstName: 'Jane',
          lastName: 'Smith',
          phone: '+254723456789',
          address: '456 Oak Ave',
          city: 'Mombasa',
          county: 'Mombasa'
        })
      },
      {
        userId: createdCustomers[2].id,
        orderNumber: 'HP' + Date.now() + '003',
        status: 'SHIPPED',
        total: 2800,
        subtotal: 2200,
        shippingCost: 0,
        paymentMethod: 'M_PESA',
        paymentStatus: 'PAID',
        shippingAddress: JSON.stringify({
          firstName: 'Mike',
          lastName: 'Johnson',
          phone: '+254734567890',
          address: '789 Pine Rd',
          city: 'Kisumu',
          county: 'Kisumu'
        })
      }
    ];

    const createdOrders = [];
    for (const order of orders) {
      const created = await prisma.order.create({ data: order });
      createdOrders.push(created);
    }

    // Create order items
    await prisma.orderItem.createMany({
      data: [
        { orderId: createdOrders[0].id, productId: createdProducts[1].id, quantity: 1, price: 4500, total: 4500 },
        { orderId: createdOrders[0].id, productId: createdProducts[3].id, quantity: 1, price: 1800, total: 1800 },
        { orderId: createdOrders[1].id, productId: createdProducts[2].id, quantity: 1, price: 3200, total: 3200 },
        { orderId: createdOrders[2].id, productId: createdProducts[7].id, quantity: 1, price: 2200, total: 2200 }
      ]
    });

    // Note: DeliveryLocation model not found in schema, skipping delivery locations

    console.log('✅ Reset and seeding completed successfully:');
    console.log(`- 1 Admin user (admin@householdplanet.co.ke / Admin@2025)`);
    console.log(`- ${createdCategories.length} categories`);
    console.log(`- ${createdProducts.length} products`);
    console.log(`- ${createdCustomers.length} sample customers`);
    console.log(`- ${createdOrders.length} sample orders`);

  } catch (error) {
    console.error('❌ Reset and seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = { resetAndSeed };

// Run if called directly
if (require.main === module) {
  resetAndSeed();
}