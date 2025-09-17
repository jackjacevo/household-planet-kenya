interface InternalLink {
  title: string
  url: string
  description?: string
}

// Homepage internal links
export const getHomepageLinks = (): InternalLink[] => [
  {
    title: 'All Products',
    url: '/products',
    description: 'Browse our complete collection of quality household items'
  },
  {
    title: 'Kitchen & Dining',
    url: '/categories/kitchen-dining',
    description: 'Essential kitchen appliances and dining accessories'
  },
  {
    title: 'Bedroom Essentials',
    url: '/categories/bedroom',
    description: 'Comfortable bedding and bedroom furniture'
  },
  {
    title: 'Bathroom Accessories',
    url: '/categories/bathroom',
    description: 'Modern bathroom fixtures and accessories'
  },
  {
    title: 'About Us',
    url: '/about',
    description: 'Learn about our commitment to quality household products'
  },
  {
    title: 'Contact Support',
    url: '/contact',
    description: 'Get help with orders, products, and delivery questions'
  }
]

// Product page internal links
export const getProductPageLinks = (category?: string): InternalLink[] => {
  const baseLinks = [
    {
      title: 'All Products',
      url: '/products',
      description: 'Explore our complete product catalog'
    },
    {
      title: 'Customer Reviews',
      url: '/reviews',
      description: 'Read what our customers say about our products'
    },
    {
      title: 'Delivery Information',
      url: '/delivery',
      description: 'Learn about our fast delivery across Kenya'
    },
    {
      title: 'Return Policy',
      url: '/returns',
      description: 'Easy returns and exchanges for your peace of mind'
    }
  ]

  if (category) {
    baseLinks.unshift({
      title: `More ${category} Products`,
      url: `/categories/${category.toLowerCase().replace(/\s+/g, '-')}`,
      description: `Discover more quality ${category.toLowerCase()} items`
    })
  }

  return baseLinks
}

// Category page internal links
export const getCategoryPageLinks = (categoryName: string): InternalLink[] => [
  {
    title: 'All Categories',
    url: '/categories',
    description: 'Browse all our product categories'
  },
  {
    title: 'Featured Products',
    url: '/products?featured=true',
    description: 'Check out our most popular items'
  },
  {
    title: 'New Arrivals',
    url: '/products?sort=newest',
    description: 'Latest additions to our collection'
  },
  {
    title: 'Best Sellers',
    url: '/products?sort=popular',
    description: 'Our customers\' favorite products'
  },
  {
    title: 'Shopping Guide',
    url: '/guide',
    description: `How to choose the best ${categoryName.toLowerCase()} products`
  }
]

// Contact page internal links
export const getContactPageLinks = (): InternalLink[] => [
  {
    title: 'Track Your Order',
    url: '/track',
    description: 'Check the status of your delivery'
  },
  {
    title: 'FAQ',
    url: '/faq',
    description: 'Find answers to common questions'
  },
  {
    title: 'Return & Exchange',
    url: '/returns',
    description: 'Learn about our return policy'
  },
  {
    title: 'Delivery Areas',
    url: '/delivery',
    description: 'Check if we deliver to your location'
  },
  {
    title: 'Bulk Orders',
    url: '/wholesale',
    description: 'Special pricing for bulk purchases'
  },
  {
    title: 'Store Location',
    url: '/store-location',
    description: 'Visit our physical store in Nairobi'
  }
]

// About page internal links
export const getAboutPageLinks = (): InternalLink[] => [
  {
    title: 'Our Products',
    url: '/products',
    description: 'Quality household items for every home'
  },
  {
    title: 'Customer Stories',
    url: '/testimonials',
    description: 'Real experiences from satisfied customers'
  },
  {
    title: 'Quality Promise',
    url: '/quality',
    description: 'Our commitment to product excellence'
  },
  {
    title: 'Careers',
    url: '/careers',
    description: 'Join our growing team'
  },
  {
    title: 'Partnership',
    url: '/partnership',
    description: 'Business partnership opportunities'
  },
  {
    title: 'Contact Us',
    url: '/contact',
    description: 'Get in touch with our team'
  }
]

// Related products based on category
export const getRelatedProductLinks = (currentProductId: string, category: string): InternalLink[] => [
  {
    title: `Best ${category} Products`,
    url: `/categories/${category.toLowerCase().replace(/\s+/g, '-')}?sort=rating`,
    description: `Top-rated ${category.toLowerCase()} items`
  },
  {
    title: `Affordable ${category}`,
    url: `/categories/${category.toLowerCase().replace(/\s+/g, '-')}?sort=price-low`,
    description: `Budget-friendly ${category.toLowerCase()} options`
  },
  {
    title: `Premium ${category}`,
    url: `/categories/${category.toLowerCase().replace(/\s+/g, '-')}?sort=price-high`,
    description: `High-end ${category.toLowerCase()} products`
  },
  {
    title: 'Customer Reviews',
    url: `/products/${currentProductId}#reviews`,
    description: 'Read what customers say about this product'
  }
]

// Footer internal links for SEO
export const getFooterSEOLinks = (): InternalLink[] => [
  {
    title: 'Kitchen Appliances Kenya',
    url: '/categories/kitchen-appliances',
    description: 'Quality kitchen appliances with fast delivery'
  },
  {
    title: 'Home Decor Nairobi',
    url: '/categories/home-decor',
    description: 'Beautiful home decoration items'
  },
  {
    title: 'Bathroom Accessories Kenya',
    url: '/categories/bathroom-accessories',
    description: 'Modern bathroom fixtures and accessories'
  },
  {
    title: 'Bedroom Furniture Nairobi',
    url: '/categories/bedroom-furniture',
    description: 'Comfortable and stylish bedroom furniture'
  },
  {
    title: 'Household Items Kenya',
    url: '/products',
    description: 'Complete range of household products'
  },
  {
    title: 'Online Shopping Kenya',
    url: '/how-to-shop',
    description: 'Easy online shopping with M-Pesa payments'
  }
]
