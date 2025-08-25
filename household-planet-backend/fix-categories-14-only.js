const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixCategories() {
  console.log('🔧 Fixing categories to have exactly 14 main categories...\n');

  try {
    // Delete child categories first, then parents
    await prisma.category.deleteMany({ where: { parentId: { not: null } } });
    await prisma.category.deleteMany({ where: { parentId: null } });
    console.log('✅ Cleared all existing categories');

    // Create exactly 14 main categories with subcategories
    const categories = [
      {
        name: 'Kitchen and Dining',
        slug: 'kitchen-dining',
        description: 'Complete kitchen essentials and dining accessories',
        image: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        children: [
          { name: 'Cookware', slug: 'cookware' },
          { name: 'Utensils', slug: 'utensils' },
          { name: 'Dinnerware', slug: 'dinnerware' },
          { name: 'Appliances', slug: 'kitchen-appliances' },
          { name: 'Storage', slug: 'kitchen-storage' }
        ]
      },
      {
        name: 'Bathroom Accessories',
        slug: 'bathroom-accessories',
        description: 'Essential bathroom items and accessories',
        image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        children: [
          { name: 'Towels', slug: 'towels' },
          { name: 'Mats', slug: 'bath-mats' },
          { name: 'Organizers', slug: 'bathroom-organizers' },
          { name: 'Fixtures', slug: 'bathroom-fixtures' },
          { name: 'Decor', slug: 'bathroom-decor' }
        ]
      },
      {
        name: 'Cleaning and Laundry',
        slug: 'cleaning-laundry',
        description: 'Cleaning supplies and laundry essentials',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        children: [
          { name: 'Cleaning Supplies', slug: 'cleaning-supplies' },
          { name: 'Tools', slug: 'cleaning-tools' },
          { name: 'Laundry Accessories', slug: 'laundry-accessories' }
        ]
      },
      {
        name: 'Beddings and Bedroom Accessories',
        slug: 'beddings-bedroom',
        description: 'Comfortable bedding and bedroom essentials',
        image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        children: [
          { name: 'Sheets', slug: 'bed-sheets' },
          { name: 'Comforters', slug: 'comforters' },
          { name: 'Pillows', slug: 'pillows' },
          { name: 'Mattress Protectors', slug: 'mattress-protectors' }
        ]
      },
      {
        name: 'Storage and Organization',
        slug: 'storage-organization',
        description: 'Smart storage solutions for every space',
        image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        children: [
          { name: 'Containers', slug: 'storage-containers' },
          { name: 'Shelving', slug: 'shelving' },
          { name: 'Closet Organizers', slug: 'closet-organizers' },
          { name: 'Baskets', slug: 'storage-baskets' }
        ]
      },
      {
        name: 'Home Decor and Accessories',
        slug: 'home-decor-accessories',
        description: 'Beautiful decor items to enhance your home',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        children: [
          { name: 'Wall Art', slug: 'wall-art' },
          { name: 'Decorative Items', slug: 'decorative-items' },
          { name: 'Rugs', slug: 'rugs' },
          { name: 'Curtains', slug: 'curtains' }
        ]
      },
      {
        name: 'Jewelry',
        slug: 'jewelry',
        description: 'Fashion jewelry and accessories',
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        children: [
          { name: 'Fashion Jewelry', slug: 'fashion-jewelry' },
          { name: 'Jewelry Boxes', slug: 'jewelry-boxes' },
          { name: 'Accessories', slug: 'jewelry-accessories' }
        ]
      },
      {
        name: 'Humidifier, Candles and Aromatherapy',
        slug: 'humidifier-candles-aromatherapy',
        description: 'Create a relaxing atmosphere with scents and humidity',
        image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        children: [
          { name: 'Essential Oils', slug: 'essential-oils' },
          { name: 'Diffusers', slug: 'diffusers' },
          { name: 'Scented Candles', slug: 'scented-candles' },
          { name: 'Humidifiers', slug: 'humidifiers' }
        ]
      },
      {
        name: 'Beauty and Cosmetics',
        slug: 'beauty-cosmetics',
        description: 'Beauty products and cosmetic accessories',
        image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        children: [
          { name: 'Skincare', slug: 'skincare' },
          { name: 'Makeup', slug: 'makeup' },
          { name: 'Tools', slug: 'beauty-tools' },
          { name: 'Mirrors', slug: 'mirrors' }
        ]
      },
      {
        name: 'Home Appliances',
        slug: 'home-appliances',
        description: 'Essential appliances for modern living',
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        children: [
          { name: 'Small Appliances', slug: 'small-appliances' },
          { name: 'Kitchen Gadgets', slug: 'kitchen-gadgets' },
          { name: 'Electronics', slug: 'electronics' }
        ]
      },
      {
        name: 'Furniture',
        slug: 'furniture',
        description: 'Quality furniture for every room',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        children: [
          { name: 'Living Room', slug: 'living-room-furniture' },
          { name: 'Bedroom', slug: 'bedroom-furniture' },
          { name: 'Dining', slug: 'dining-furniture' },
          { name: 'Office', slug: 'office-furniture' }
        ]
      },
      {
        name: 'Outdoor and Garden',
        slug: 'outdoor-garden',
        description: 'Outdoor living and gardening essentials',
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        children: [
          { name: 'Patio Furniture', slug: 'patio-furniture' },
          { name: 'Garden Tools', slug: 'garden-tools' },
          { name: 'Planters', slug: 'planters' }
        ]
      },
      {
        name: 'Lighting and Electrical',
        slug: 'lighting-electrical',
        description: 'Lighting solutions and electrical accessories',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        children: [
          { name: 'Lamps', slug: 'lamps' },
          { name: 'Fixtures', slug: 'light-fixtures' },
          { name: 'Bulbs', slug: 'light-bulbs' },
          { name: 'Extension Cords', slug: 'extension-cords' }
        ]
      },
      {
        name: 'Bags and Belts',
        slug: 'bags-belts',
        description: 'Stylish bags and belts for every occasion',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        children: [
          { name: 'Handbags', slug: 'handbags' },
          { name: 'Backpacks', slug: 'backpacks' },
          { name: 'Belts', slug: 'belts' },
          { name: 'Travel Bags', slug: 'travel-bags' }
        ]
      }
    ];

    let totalCreated = 0;

    for (let i = 0; i < categories.length; i++) {
      const categoryData = categories[i];
      
      // Create parent category
      const parentCategory = await prisma.category.create({
        data: {
          name: categoryData.name,
          slug: categoryData.slug,
          description: categoryData.description,
          image: categoryData.image,
          isActive: true,
          sortOrder: i
        }
      });
      
      totalCreated++;
      console.log(`✅ Created: ${categoryData.name}`);

      // Create subcategories
      for (let j = 0; j < categoryData.children.length; j++) {
        const childData = categoryData.children[j];
        await prisma.category.create({
          data: {
            name: childData.name,
            slug: childData.slug,
            parentId: parentCategory.id,
            isActive: true,
            sortOrder: j
          }
        });
        totalCreated++;
      }
    }

    console.log(`\n🎉 Created ${totalCreated} categories total`);
    console.log(`📊 14 main categories + ${totalCreated - 14} subcategories`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

async function main() {
  try {
    await fixCategories();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}