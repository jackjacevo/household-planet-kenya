const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function autoSeed() {
  try {
    console.log('🌱 Auto-seeding database...');

    // Check if data already exists
    const existingCategories = await prisma.category.count();
    if (existingCategories > 0) {
      console.log('✅ Database already seeded');
      return;
    }

    // Create admin user
    const adminPassword = await bcrypt.hash('Admin@2025', 12);
    await prisma.user.upsert({
      where: { email: 'admin@householdplanetkenya.co.ke' },
      update: {},
      create: {
        email: 'admin@householdplanetkenya.co.ke',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        name: 'Admin User',
        role: 'SUPER_ADMIN',
        emailVerified: true,
        isActive: true,
        permissions: JSON.stringify(['admin:read', 'admin:write', 'admin:delete'])
      }
    });

    // Create categories
    const categories = [
      { name: 'Kitchen and Dining', slug: 'kitchen-dining', description: 'Cookware, Utensils, Dinnerware, Appliances, Storage' },
      { name: 'Bathroom Accessories', slug: 'bathroom-accessories', description: 'Towels, Mats, Organizers, Fixtures, Decor' },
      { name: 'Cleaning and Laundry', slug: 'cleaning-laundry', description: 'Cleaning Supplies, Tools, Laundry Accessories' },
      { name: 'Beddings and Bedroom Accessories', slug: 'beddings-bedroom', description: 'Sheets, Comforters, Pillows, Mattress Protectors' },
      { name: 'Storage and Organization', slug: 'storage-organization', description: 'Containers, Shelving, Closet Organizers, Baskets' },
      { name: 'Home Decor and Accessories', slug: 'home-decor', description: 'Wall Art, Decorative Items, Rugs, Curtains' },
      { name: 'Jewelry', slug: 'jewelry', description: 'Fashion Jewelry, Jewelry Boxes, Accessories' },
      { name: 'Humidifier, Candles and Aromatherapy', slug: 'aromatherapy', description: 'Essential Oils, Diffusers, Scented Candles' },
      { name: 'Beauty and Cosmetics', slug: 'beauty-cosmetics', description: 'Skincare, Makeup, Tools, Mirrors' },
      { name: 'Home Appliances', slug: 'home-appliances', description: 'Small Appliances, Kitchen Gadgets, Electronics' },
      { name: 'Furniture', slug: 'furniture', description: 'Living Room, Bedroom, Dining, Office Furniture' },
      { name: 'Outdoor and Garden', slug: 'outdoor-garden', description: 'Patio Furniture, Garden Tools, Planters' },
      { name: 'Lighting and Electrical', slug: 'lighting-electrical', description: 'Lamps, Fixtures, Bulbs, Extension Cords' },
      { name: 'Bags and Belts', slug: 'bags-belts', description: 'Handbags, Backpacks, Belts, Accessories' }
    ];

    for (const category of categories) {
      await prisma.category.create({ data: category });
    }

    // Create products
    const products = [
      { name: 'Non-Stick Frying Pan Set', slug: 'non-stick-frying-pan-set', sku: 'KIT-PAN-001', description: '3-piece non-stick frying pan set', price: 2500, comparePrice: 3000, categoryId: 1, stock: 50, isFeatured: true, images: JSON.stringify([]), tags: JSON.stringify(['kitchen', 'cookware']) },
      { name: 'Stainless Steel Cookware Set', slug: 'stainless-steel-cookware-set', sku: 'KIT-COO-001', description: '7-piece stainless steel cookware set', price: 4500, comparePrice: 5500, categoryId: 1, stock: 30, isFeatured: true, images: JSON.stringify([]), tags: JSON.stringify(['kitchen', 'cookware']) },
      { name: 'Cotton Bath Towel Set', slug: 'cotton-bath-towel-set', sku: 'BAT-TOW-001', description: '6-piece cotton bath towel set', price: 1800, comparePrice: 2200, categoryId: 2, stock: 40, isFeatured: true, images: JSON.stringify([]), tags: JSON.stringify(['bathroom', 'towels']) },
      { name: 'All-Purpose Cleaner 500ml', slug: 'all-purpose-cleaner-500ml', sku: 'CLN-APC-001', description: 'Multi-surface cleaning solution', price: 350, comparePrice: 450, categoryId: 3, stock: 100, isFeatured: true, images: JSON.stringify([]), tags: JSON.stringify(['cleaning']) },
      { name: 'Cotton Bed Sheet Set', slug: 'cotton-bed-sheet-set', sku: 'BED-SHE-001', description: 'Queen size cotton bed sheet set', price: 2200, comparePrice: 2800, categoryId: 4, stock: 35, isFeatured: true, images: JSON.stringify([]), tags: JSON.stringify(['bedding']) },
      { name: 'Storage Basket Set', slug: 'storage-basket-set', sku: 'STO-BAS-001', description: '3-piece woven storage basket set', price: 1200, comparePrice: 1500, categoryId: 5, stock: 30, isFeatured: true, images: JSON.stringify([]), tags: JSON.stringify(['storage']) },
      { name: 'Decorative Wall Mirror', slug: 'decorative-wall-mirror', sku: 'DEC-MIR-001', description: 'Round decorative wall mirror', price: 2800, comparePrice: 3500, categoryId: 6, stock: 20, isFeatured: true, images: JSON.stringify([]), tags: JSON.stringify(['decor']) },
      { name: 'Skincare Gift Set', slug: 'skincare-gift-set', sku: 'BEA-SKI-001', description: 'Complete skincare routine set', price: 3500, comparePrice: 4200, categoryId: 9, stock: 25, isFeatured: true, images: JSON.stringify([]), tags: JSON.stringify(['beauty']) },
      { name: 'Electric Kettle 1.7L', slug: 'electric-kettle-17l', sku: 'APP-KET-001', description: 'Stainless steel electric kettle', price: 2200, comparePrice: 2800, categoryId: 10, stock: 35, isFeatured: true, images: JSON.stringify([]), tags: JSON.stringify(['appliances']) }
    ];

    for (const product of products) {
      await prisma.product.create({ data: product });
    }

    console.log('✅ Auto-seeding completed: 14 categories, 9 products');
  } catch (error) {
    console.error('❌ Auto-seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = { autoSeed };