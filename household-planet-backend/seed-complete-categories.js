const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const categories = [
  {
    name: 'Kitchen and Dining',
    slug: 'kitchen-dining',
    description: 'Complete kitchen essentials and dining accessories',
    image: '/images/categories/kitchen.svg',
    children: [
      { name: 'Cookware', slug: 'cookware', description: 'Pots, pans, and cooking vessels' },
      { name: 'Utensils', slug: 'utensils', description: 'Kitchen tools and utensils' },
      { name: 'Dinnerware', slug: 'dinnerware', description: 'Plates, bowls, and serving dishes' },
      { name: 'Kitchen Appliances', slug: 'kitchen-appliances', description: 'Small kitchen appliances' },
      { name: 'Kitchen Storage', slug: 'kitchen-storage', description: 'Food storage and organization' }
    ]
  },
  {
    name: 'Bathroom Accessories',
    slug: 'bathroom-accessories',
    description: 'Essential bathroom items and accessories',
    image: '/images/categories/bathroom.svg',
    children: [
      { name: 'Towels', slug: 'towels', description: 'Bath towels and washcloths' },
      { name: 'Bath Mats', slug: 'bath-mats', description: 'Non-slip bathroom mats' },
      { name: 'Bathroom Organizers', slug: 'bathroom-organizers', description: 'Storage and organization solutions' },
      { name: 'Bathroom Fixtures', slug: 'bathroom-fixtures', description: 'Faucets, handles, and hardware' },
      { name: 'Bathroom Decor', slug: 'bathroom-decor', description: 'Decorative bathroom accessories' }
    ]
  },
  {
    name: 'Cleaning and Laundry',
    slug: 'cleaning-laundry',
    description: 'Cleaning supplies and laundry essentials',
    image: '/images/categories/cleaning.svg',
    children: [
      { name: 'Cleaning Supplies', slug: 'cleaning-supplies', description: 'Detergents, disinfectants, and cleaners' },
      { name: 'Cleaning Tools', slug: 'cleaning-tools', description: 'Mops, brooms, and cleaning equipment' },
      { name: 'Laundry Accessories', slug: 'laundry-accessories', description: 'Baskets, hangers, and laundry aids' }
    ]
  },
  {
    name: 'Beddings and Bedroom Accessories',
    slug: 'beddings-bedroom',
    description: 'Comfortable bedding and bedroom essentials',
    image: '/images/categories/bedroom.svg',
    children: [
      { name: 'Bed Sheets', slug: 'bed-sheets', description: 'Quality bed sheets and pillowcases' },
      { name: 'Comforters', slug: 'comforters', description: 'Duvets, comforters, and blankets' },
      { name: 'Pillows', slug: 'pillows', description: 'Sleeping and decorative pillows' },
      { name: 'Mattress Protectors', slug: 'mattress-protectors', description: 'Mattress covers and protectors' }
    ]
  },
  {
    name: 'Storage and Organization',
    slug: 'storage-organization',
    description: 'Smart storage solutions for every space',
    image: '/images/categories/storage.svg',
    children: [
      { name: 'Storage Containers', slug: 'storage-containers', description: 'Boxes, bins, and containers' },
      { name: 'Shelving', slug: 'shelving', description: 'Wall shelves and storage units' },
      { name: 'Closet Organizers', slug: 'closet-organizers', description: 'Wardrobe and closet organization' },
      { name: 'Storage Baskets', slug: 'storage-baskets', description: 'Decorative and functional baskets' }
    ]
  },
  {
    name: 'Home Decor and Accessories',
    slug: 'home-decor-accessories',
    description: 'Beautiful decor items to enhance your home',
    image: '/images/categories/decor.svg',
    children: [
      { name: 'Wall Art', slug: 'wall-art', description: 'Paintings, prints, and wall decorations' },
      { name: 'Decorative Items', slug: 'decorative-items', description: 'Vases, sculptures, and ornaments' },
      { name: 'Rugs', slug: 'rugs', description: 'Area rugs and floor coverings' },
      { name: 'Curtains', slug: 'curtains', description: 'Window treatments and drapes' }
    ]
  },
  {
    name: 'Jewelry',
    slug: 'jewelry',
    description: 'Fashion jewelry and accessories',
    image: '/images/categories/jewelry.svg',
    children: [
      { name: 'Fashion Jewelry', slug: 'fashion-jewelry', description: 'Trendy and affordable jewelry pieces' },
      { name: 'Jewelry Boxes', slug: 'jewelry-boxes', description: 'Storage and display for jewelry' },
      { name: 'Jewelry Accessories', slug: 'jewelry-accessories', description: 'Cleaning kits and organizers' }
    ]
  },
  {
    name: 'Humidifier, Candles and Aromatherapy',
    slug: 'humidifier-candles-aromatherapy',
    description: 'Create a relaxing atmosphere with scents and humidity',
    image: '/images/categories/aromatherapy.svg',
    children: [
      { name: 'Essential Oils', slug: 'essential-oils', description: 'Pure and therapeutic essential oils' },
      { name: 'Diffusers', slug: 'diffusers', description: 'Ultrasonic and reed diffusers' },
      { name: 'Scented Candles', slug: 'scented-candles', description: 'Aromatic candles for ambiance' },
      { name: 'Humidifiers', slug: 'humidifiers', description: 'Air humidifiers and purifiers' }
    ]
  },
  {
    name: 'Beauty and Cosmetics',
    slug: 'beauty-cosmetics',
    description: 'Beauty products and cosmetic accessories',
    image: '/images/categories/beauty.svg',
    children: [
      { name: 'Skincare', slug: 'skincare', description: 'Face and body care products' },
      { name: 'Makeup', slug: 'makeup', description: 'Cosmetics and color products' },
      { name: 'Beauty Tools', slug: 'beauty-tools', description: 'Brushes, sponges, and applicators' },
      { name: 'Mirrors', slug: 'mirrors', description: 'Vanity and makeup mirrors' }
    ]
  },
  {
    name: 'Home Appliances',
    slug: 'home-appliances',
    description: 'Essential appliances for modern living',
    image: '/images/categories/appliances.svg',
    children: [
      { name: 'Small Appliances', slug: 'small-appliances', description: 'Blenders, toasters, and coffee makers' },
      { name: 'Kitchen Gadgets', slug: 'kitchen-gadgets', description: 'Innovative kitchen tools and gadgets' },
      { name: 'Electronics', slug: 'electronics', description: 'Home electronics and devices' }
    ]
  },
  {
    name: 'Furniture',
    slug: 'furniture',
    description: 'Quality furniture for every room',
    image: '/images/categories/furniture.svg',
    children: [
      { name: 'Living Room Furniture', slug: 'living-room-furniture', description: 'Sofas, chairs, and coffee tables' },
      { name: 'Bedroom Furniture', slug: 'bedroom-furniture', description: 'Beds, dressers, and nightstands' },
      { name: 'Dining Furniture', slug: 'dining-furniture', description: 'Dining tables and chairs' },
      { name: 'Office Furniture', slug: 'office-furniture', description: 'Desks, chairs, and office storage' }
    ]
  },
  {
    name: 'Outdoor and Garden',
    slug: 'outdoor-garden',
    description: 'Outdoor living and gardening essentials',
    image: '/images/categories/outdoor.svg',
    children: [
      { name: 'Patio Furniture', slug: 'patio-furniture', description: 'Outdoor seating and tables' },
      { name: 'Garden Tools', slug: 'garden-tools', description: 'Gardening equipment and tools' },
      { name: 'Planters', slug: 'planters', description: 'Pots and planters for plants' }
    ]
  },
  {
    name: 'Lighting and Electrical',
    slug: 'lighting-electrical',
    description: 'Lighting solutions and electrical accessories',
    image: '/images/categories/lighting.svg',
    children: [
      { name: 'Lamps', slug: 'lamps', description: 'Table lamps, floor lamps, and desk lamps' },
      { name: 'Light Fixtures', slug: 'light-fixtures', description: 'Ceiling lights and chandeliers' },
      { name: 'Light Bulbs', slug: 'light-bulbs', description: 'LED, CFL, and specialty bulbs' },
      { name: 'Extension Cords', slug: 'extension-cords', description: 'Power strips and extension cables' }
    ]
  },
  {
    name: 'Bags and Belts',
    slug: 'bags-belts',
    description: 'Stylish bags and belts for every occasion',
    image: '/images/categories/bags.svg',
    children: [
      { name: 'Handbags', slug: 'handbags', description: 'Purses, totes, and shoulder bags' },
      { name: 'Backpacks', slug: 'backpacks', description: 'School, travel, and laptop backpacks' },
      { name: 'Belts', slug: 'belts', description: 'Leather and fabric belts' },
      { name: 'Travel Bags', slug: 'travel-bags', description: 'Luggage and travel accessories' }
    ]
  }
];

async function seedCategories() {
  console.log('🌱 Starting category seeding...');

  try {
    // First, get existing categories to avoid duplicates
    const existingCategories = await prisma.category.findMany({
      select: { slug: true, name: true }
    });
    
    const existingSlugs = new Set(existingCategories.map(cat => cat.slug));
    console.log(`📋 Found ${existingCategories.length} existing categories`);

    let createdCount = 0;
    let updatedCount = 0;

    for (const categoryData of categories) {
      let parentCategory;

      if (existingSlugs.has(categoryData.slug)) {
        // Update existing parent category
        parentCategory = await prisma.category.update({
          where: { slug: categoryData.slug },
          data: {
            name: categoryData.name,
            description: categoryData.description,
            image: categoryData.image,
            isActive: true
          }
        });
        updatedCount++;
        console.log(`✅ Updated parent category: ${categoryData.name}`);
      } else {
        // Create new parent category
        parentCategory = await prisma.category.create({
          data: {
            name: categoryData.name,
            slug: categoryData.slug,
            description: categoryData.description,
            image: categoryData.image,
            isActive: true,
            sortOrder: createdCount
          }
        });
        createdCount++;
        console.log(`🆕 Created parent category: ${categoryData.name}`);
      }

      // Handle subcategories
      if (categoryData.children && categoryData.children.length > 0) {
        for (let i = 0; i < categoryData.children.length; i++) {
          const childData = categoryData.children[i];
          
          if (existingSlugs.has(childData.slug)) {
            // Update existing subcategory
            await prisma.category.update({
              where: { slug: childData.slug },
              data: {
                name: childData.name,
                description: childData.description,
                parentId: parentCategory.id,
                isActive: true,
                sortOrder: i
              }
            });
            updatedCount++;
            console.log(`  ✅ Updated subcategory: ${childData.name}`);
          } else {
            // Create new subcategory
            await prisma.category.create({
              data: {
                name: childData.name,
                slug: childData.slug,
                description: childData.description,
                parentId: parentCategory.id,
                isActive: true,
                sortOrder: i
              }
            });
            createdCount++;
            console.log(`  🆕 Created subcategory: ${childData.name}`);
          }
        }
      }
    }

    console.log(`\n🎉 Category seeding completed!`);
    console.log(`📊 Summary:`);
    console.log(`   - Created: ${createdCount} categories`);
    console.log(`   - Updated: ${updatedCount} categories`);
    
    // Display final category count
    const totalCategories = await prisma.category.count();
    console.log(`   - Total categories: ${totalCategories}`);

  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  }
}

async function main() {
  try {
    await seedCategories();
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

module.exports = { seedCategories };