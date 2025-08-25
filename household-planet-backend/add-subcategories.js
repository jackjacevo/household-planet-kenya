const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addSubcategories() {
  console.log('➕ Adding subcategories to main categories...\n');

  try {
    const subcategoriesData = [
      {
        parentSlug: 'kitchen-dining',
        children: [
          { name: 'Cookware', slug: 'cookware' },
          { name: 'Utensils', slug: 'utensils' },
          { name: 'Dinnerware', slug: 'dinnerware' },
          { name: 'Appliances', slug: 'kitchen-appliances' },
          { name: 'Storage', slug: 'kitchen-storage' }
        ]
      },
      {
        parentSlug: 'bathroom-accessories',
        children: [
          { name: 'Towels', slug: 'towels' },
          { name: 'Mats', slug: 'bath-mats' },
          { name: 'Organizers', slug: 'bathroom-organizers' },
          { name: 'Fixtures', slug: 'bathroom-fixtures' },
          { name: 'Decor', slug: 'bathroom-decor' }
        ]
      },
      {
        parentSlug: 'cleaning-laundry',
        children: [
          { name: 'Cleaning Supplies', slug: 'cleaning-supplies' },
          { name: 'Tools', slug: 'cleaning-tools' },
          { name: 'Laundry Accessories', slug: 'laundry-accessories' }
        ]
      },
      {
        parentSlug: 'beddings-bedroom',
        children: [
          { name: 'Sheets', slug: 'bed-sheets' },
          { name: 'Comforters', slug: 'comforters' },
          { name: 'Pillows', slug: 'pillows' },
          { name: 'Mattress Protectors', slug: 'mattress-protectors' }
        ]
      },
      {
        parentSlug: 'storage-organization',
        children: [
          { name: 'Containers', slug: 'storage-containers' },
          { name: 'Shelving', slug: 'shelving' },
          { name: 'Closet Organizers', slug: 'closet-organizers' },
          { name: 'Baskets', slug: 'storage-baskets' }
        ]
      },
      {
        parentSlug: 'home-decor-accessories',
        children: [
          { name: 'Wall Art', slug: 'wall-art' },
          { name: 'Decorative Items', slug: 'decorative-items' },
          { name: 'Rugs', slug: 'rugs' },
          { name: 'Curtains', slug: 'curtains' }
        ]
      },
      {
        parentSlug: 'jewelry',
        children: [
          { name: 'Fashion Jewelry', slug: 'fashion-jewelry' },
          { name: 'Jewelry Boxes', slug: 'jewelry-boxes' },
          { name: 'Accessories', slug: 'jewelry-accessories' }
        ]
      },
      {
        parentSlug: 'humidifier-candles-aromatherapy',
        children: [
          { name: 'Essential Oils', slug: 'essential-oils' },
          { name: 'Diffusers', slug: 'diffusers' },
          { name: 'Scented Candles', slug: 'scented-candles' },
          { name: 'Humidifiers', slug: 'humidifiers' }
        ]
      },
      {
        parentSlug: 'beauty-cosmetics',
        children: [
          { name: 'Skincare', slug: 'skincare' },
          { name: 'Makeup', slug: 'makeup' },
          { name: 'Tools', slug: 'beauty-tools' },
          { name: 'Mirrors', slug: 'mirrors' }
        ]
      },
      {
        parentSlug: 'home-appliances',
        children: [
          { name: 'Small Appliances', slug: 'small-appliances' },
          { name: 'Kitchen Gadgets', slug: 'kitchen-gadgets' },
          { name: 'Electronics', slug: 'electronics' }
        ]
      },
      {
        parentSlug: 'furniture',
        children: [
          { name: 'Living Room', slug: 'living-room-furniture' },
          { name: 'Bedroom', slug: 'bedroom-furniture' },
          { name: 'Dining', slug: 'dining-furniture' },
          { name: 'Office', slug: 'office-furniture' }
        ]
      },
      {
        parentSlug: 'outdoor-garden',
        children: [
          { name: 'Patio Furniture', slug: 'patio-furniture' },
          { name: 'Garden Tools', slug: 'garden-tools' },
          { name: 'Planters', slug: 'planters' }
        ]
      },
      {
        parentSlug: 'lighting-electrical',
        children: [
          { name: 'Lamps', slug: 'lamps' },
          { name: 'Fixtures', slug: 'light-fixtures' },
          { name: 'Bulbs', slug: 'light-bulbs' },
          { name: 'Extension Cords', slug: 'extension-cords' }
        ]
      },
      {
        parentSlug: 'bags-belts',
        children: [
          { name: 'Handbags', slug: 'handbags' },
          { name: 'Backpacks', slug: 'backpacks' },
          { name: 'Belts', slug: 'belts' },
          { name: 'Travel Bags', slug: 'travel-bags' }
        ]
      }
    ];

    let totalAdded = 0;

    for (const categoryData of subcategoriesData) {
      // Find parent category
      const parent = await prisma.category.findUnique({
        where: { slug: categoryData.parentSlug }
      });

      if (!parent) {
        console.log(`❌ Parent category not found: ${categoryData.parentSlug}`);
        continue;
      }

      console.log(`📁 Adding subcategories to: ${parent.name}`);

      // Add subcategories
      for (let i = 0; i < categoryData.children.length; i++) {
        const childData = categoryData.children[i];
        
        // Check if subcategory already exists
        const existing = await prisma.category.findUnique({
          where: { slug: childData.slug }
        });

        if (existing) {
          // Update parent if needed
          if (existing.parentId !== parent.id) {
            await prisma.category.update({
              where: { id: existing.id },
              data: { parentId: parent.id, isActive: true }
            });
            console.log(`  ✅ Updated: ${childData.name}`);
          } else {
            console.log(`  ⏭️  Exists: ${childData.name}`);
          }
        } else {
          // Create new subcategory
          await prisma.category.create({
            data: {
              name: childData.name,
              slug: childData.slug,
              parentId: parent.id,
              isActive: true,
              sortOrder: i
            }
          });
          console.log(`  ➕ Created: ${childData.name}`);
          totalAdded++;
        }
      }
    }

    console.log(`\n🎉 Added/updated ${totalAdded} subcategories`);

    // Final verification
    const hierarchy = await prisma.category.findMany({
      where: { isActive: true, parentId: null },
      include: {
        children: { where: { isActive: true } }
      }
    });

    console.log(`\n📊 Final structure:`);
    hierarchy.forEach(parent => {
      console.log(`${parent.name}: ${parent.children.length} subcategories`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

async function main() {
  try {
    await addSubcategories();
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