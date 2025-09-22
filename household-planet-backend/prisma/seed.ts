import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@2025', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@householdplanet.co.ke' },
    update: {},
    create: {
      email: 'admin@householdplanet.co.ke',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      name: 'Admin User',
      role: 'SUPER_ADMIN',
      emailVerified: true,
      isActive: true,
    },
  });

  // Create categories
  const categories = [
    { name: 'Kitchen & Dining', slug: 'kitchen-dining', description: 'Kitchen appliances, cookware, and dining essentials' },
    { name: 'Home Cleaning', slug: 'home-cleaning', description: 'Cleaning supplies and equipment' },
    { name: 'Bathroom Essentials', slug: 'bathroom-essentials', description: 'Bathroom accessories and toiletries' },
    { name: 'Storage & Organization', slug: 'storage-organization', description: 'Storage solutions and organizers' },
    { name: 'Laundry & Ironing', slug: 'laundry-ironing', description: 'Laundry supplies and ironing equipment' },
    { name: 'Home Decor', slug: 'home-decor', description: 'Decorative items and home accessories' },
    { name: 'Electronics', slug: 'electronics', description: 'Home electronics and appliances' },
    { name: 'Garden & Outdoor', slug: 'garden-outdoor', description: 'Garden tools and outdoor equipment' },
  ];

  const createdCategories = [];
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
    createdCategories.push(created);
  }

  // Create brands
  const brands = [
    { name: 'KitchenAid', slug: 'kitchenaid' },
    { name: 'Philips', slug: 'philips' },
    { name: 'Samsung', slug: 'samsung' },
    { name: 'LG', slug: 'lg' },
    { name: 'Bosch', slug: 'bosch' },
    { name: 'Generic', slug: 'generic' },
  ];

  const createdBrands = [];
  for (const brand of brands) {
    const created = await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {},
      create: brand,
    });
    createdBrands.push(created);
  }

  // Create sample products with real images
  const products = [
    {
      name: 'Non-Stick Frying Pan Set',
      slug: 'non-stick-frying-pan-set',
      description: 'Professional grade non-stick frying pan set with heat-resistant handles',
      shortDescription: '3-piece non-stick frying pan set',
      sku: 'KIT-PAN-001',
      price: 2500,
      comparePrice: 3000,
      categoryId: createdCategories[0].id,
      brandId: createdBrands[5].id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop']),
      tags: JSON.stringify(['kitchen', 'cookware', 'non-stick']),
      stock: 50,
      isFeatured: true,
    },
    {
      name: 'Stainless Steel Cookware Set',
      slug: 'stainless-steel-cookware-set',
      description: 'Premium stainless steel cookware set with 8 pieces including pots, pans and lids',
      shortDescription: '8-piece stainless steel set',
      sku: 'KIT-COO-001',
      price: 4500,
      comparePrice: 5500,
      categoryId: createdCategories[0].id,
      brandId: createdBrands[1].id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop']),
      tags: JSON.stringify(['kitchen', 'cookware', 'stainless-steel']),
      stock: 25,
      isFeatured: true,
    },
    {
      name: 'Glass Water Bottle Set',
      slug: 'glass-water-bottle-set',
      description: 'Eco-friendly glass water bottles set of 4. BPA-free and dishwasher safe.',
      shortDescription: 'Eco-friendly glass bottles',
      sku: 'KIT-BOT-001',
      price: 1800,
      comparePrice: 2200,
      categoryId: createdCategories[0].id,
      brandId: createdBrands[5].id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1523362628745-0c100150b504?w=500&h=500&fit=crop']),
      tags: JSON.stringify(['kitchen', 'bottles', 'eco-friendly']),
      stock: 35,
      isFeatured: true,
    },
    {
      name: 'All-Purpose Cleaner 500ml',
      slug: 'all-purpose-cleaner-500ml',
      description: 'Multi-surface cleaner suitable for kitchen, bathroom, and general cleaning',
      shortDescription: 'Multi-surface cleaning solution',
      sku: 'CLN-APC-001',
      price: 350,
      comparePrice: 450,
      categoryId: createdCategories[1].id,
      brandId: createdBrands[5].id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500&h=500&fit=crop']),
      tags: JSON.stringify(['cleaning', 'household', 'multi-surface']),
      stock: 100,
    },
    {
      name: 'Storage Basket Set',
      slug: 'storage-basket-set',
      description: 'Set of 3 woven storage baskets in different sizes for home organization',
      shortDescription: '3-piece storage basket set',
      sku: 'STO-BAS-001',
      price: 1200,
      comparePrice: 1500,
      categoryId: createdCategories[3].id,
      brandId: createdBrands[5].id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop']),
      tags: JSON.stringify(['storage', 'organization', 'baskets']),
      stock: 30,
    },
    {
      name: 'Bathroom Towel Set',
      slug: 'bathroom-towel-set',
      description: 'Soft cotton towel set including bath towels, hand towels, and face towels',
      shortDescription: 'Cotton towel set - 6 pieces',
      sku: 'BAT-TOW-001',
      price: 1800,
      comparePrice: 2200,
      categoryId: createdCategories[2].id,
      brandId: createdBrands[5].id,
      images: JSON.stringify(['https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=500&h=500&fit=crop']),
      tags: JSON.stringify(['bathroom', 'towels', 'cotton']),
      stock: 40,
    },
  ];

  const createdProducts = [];
  for (const product of products) {
    const created = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
    createdProducts.push(created);
  }

  // Create sample customers
  const customerPassword = await bcrypt.hash('Customer@123', 12);
  const customers = [
    {
      email: 'john.doe@example.com',
      password: customerPassword,
      firstName: 'John',
      lastName: 'Doe',
      name: 'John Doe',
      phone: '+254712345678',
      role: 'CUSTOMER',
      emailVerified: true,
    },
    {
      email: 'jane.smith@example.com',
      password: customerPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      name: 'Jane Smith',
      phone: '+254723456789',
      role: 'CUSTOMER',
      emailVerified: true,
    },
  ];

  const createdCustomers = [];
  for (const customer of customers) {
    const created = await prisma.user.upsert({
      where: { email: customer.email },
      update: {},
      create: customer,
    });
    createdCustomers.push(created);
  }

  // Create sample orders
  const orders = [
    {
      userId: createdCustomers[0].id,
      orderNumber: 'ORD-2024-001',
      status: 'DELIVERED',
      subtotal: 2500,
      shippingCost: 200,
      total: 2700,
      shippingAddress: JSON.stringify({
        fullName: 'John Doe',
        phone: '+254712345678',
        county: 'Nairobi',
        town: 'Nairobi',
        street: '123 Main Street'
      }),
      paymentMethod: 'MPESA',
      paymentStatus: 'COMPLETED',
      trackingNumber: 'TRK-001',
    },
    {
      userId: createdCustomers[1].id,
      orderNumber: 'ORD-2024-002',
      status: 'PROCESSING',
      subtotal: 8500,
      shippingCost: 300,
      total: 8800,
      shippingAddress: JSON.stringify({
        fullName: 'Jane Smith',
        phone: '+254723456789',
        county: 'Kiambu',
        town: 'Thika',
        street: '456 Oak Avenue'
      }),
      paymentMethod: 'MPESA',
      paymentStatus: 'COMPLETED',
      trackingNumber: 'TRK-002',
    },
  ];

  const createdOrders = [];
  for (const order of orders) {
    const created = await prisma.order.upsert({
      where: { orderNumber: order.orderNumber },
      update: {},
      create: order,
    });
    createdOrders.push(created);
  }

  // Create order items
  await prisma.orderItem.upsert({
    where: { id: 1 },
    update: {},
    create: {
      orderId: createdOrders[0].id,
      productId: createdProducts[0].id,
      quantity: 1,
      price: 2500,
      total: 2500,
    },
  });

  await prisma.orderItem.upsert({
    where: { id: 2 },
    update: {},
    create: {
      orderId: createdOrders[1].id,
      productId: createdProducts[1].id,
      quantity: 1,
      price: 8500,
      total: 8500,
    },
  });

  // Create settings
  const settings = [
    { category: 'company', key: 'site_name', value: 'Household Planet Kenya', type: 'string', isPublic: true },
    { category: 'company', key: 'site_description', value: 'Your one-stop shop for household items in Kenya', type: 'string', isPublic: true },
    { category: 'company', key: 'contact_email', value: 'info@householdplanetkenya.co.ke', type: 'string', isPublic: true },
    { category: 'company', key: 'contact_phone', value: '+254700000000', type: 'string', isPublic: true },
    { category: 'shipping', key: 'free_shipping_threshold', value: '5000', type: 'number', isPublic: true },
    { category: 'shipping', key: 'standard_shipping_cost', value: '200', type: 'number', isPublic: true },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { category_key: { category: setting.category, key: setting.key } },
      update: {},
      create: setting,
    });
  }

  console.log('✅ Database seeding completed successfully!');
  console.log(`👤 Admin user: admin@householdplanet.co.ke / Admin@2025`);
  console.log(`📦 Created ${createdCategories.length} categories`);
  console.log(`🏷️ Created ${createdBrands.length} brands`);
  console.log(`🛍️ Created ${createdProducts.length} products`);
  console.log(`👥 Created ${createdCustomers.length} customers`);
  console.log(`📋 Created ${createdOrders.length} orders`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });