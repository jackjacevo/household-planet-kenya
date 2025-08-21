import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SeoService {
  constructor(private prisma: PrismaService) {}

  // Product description SEO optimization
  async optimizeProductDescription(productId: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { category: true, brand: true }
    });

    if (!product) return null;

    const keywords = this.extractKeywords(product);
    const optimizedDescription = this.generateSeoDescription(product, keywords);
    const metaTitle = this.generateMetaTitle(product);
    const altText = this.generateImageAltText(product);

    return {
      metaTitle,
      metaDescription: optimizedDescription,
      keywords,
      altText,
      structuredData: this.generateProductSchema(product)
    };
  }

  // Category page SEO optimization
  async optimizeCategoryPage(categoryId: number) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      include: { 
        products: { 
          where: { isActive: true },
          take: 10,
          include: { brand: true }
        }
      }
    });

    if (!category) return null;

    const keywords = this.generateCategoryKeywords(category);
    const content = this.generateCategoryContent(category, keywords);

    return {
      metaTitle: `${category.name} - Quality Home Products Kenya | Household Planet`,
      metaDescription: `Shop premium ${category.name.toLowerCase()} in Kenya. Fast delivery, M-Pesa payments, quality guaranteed. ${category.products.length}+ products available.`,
      keywords,
      content,
      structuredData: this.generateCategorySchema(category)
    };
  }



  // URL structure optimization
  generateOptimizedUrl(title: string, type: 'product' | 'category' | 'blog'): string {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const prefixes = {
      product: 'products',
      category: 'categories', 
      blog: 'blog'
    };

    return `/${prefixes[type]}/${slug}`;
  }

  // Site search analytics
  async trackSearch(query: string, userId?: number, results?: number) {
    return this.prisma.searchQuery.create({
      data: {
        query: query.toLowerCase(),
        userId,
        resultCount: results || 0,
        timestamp: new Date()
      }
    });
  }

  async getSearchAnalytics(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [topQueries, noResults, trends] = await Promise.all([
      this.prisma.searchQuery.groupBy({
        by: ['query'],
        where: { timestamp: { gte: since } },
        _count: { query: true },
        orderBy: { _count: { query: 'desc' } },
        take: 20
      }),
      this.prisma.searchQuery.findMany({
        where: { 
          timestamp: { gte: since },
          resultCount: 0
        },
        select: { query: true },
        distinct: ['query'],
        take: 10
      }),
      this.prisma.searchQuery.groupBy({
        by: ['query'],
        where: { 
          timestamp: { gte: since },
          resultCount: { gt: 0 }
        },
        _avg: { resultCount: true },
        _count: { query: true },
        orderBy: { _count: { query: 'desc' } }
      })
    ]);

    return { topQueries, noResults, trends };
  }

  private extractKeywords(product: any): string[] {
    const keywords = [];
    
    // Add product name words
    keywords.push(...product.name.toLowerCase().split(' '));
    
    // Add category
    if (product.category) {
      keywords.push(product.category.name.toLowerCase());
    }
    
    // Add brand
    if (product.brand) {
      keywords.push(product.brand.name.toLowerCase());
    }
    
    // Add location-based keywords
    keywords.push('kenya', 'nairobi', 'household', 'home');
    
    return [...new Set(keywords)].filter(k => k.length > 2);
  }

  private generateSeoDescription(product: any, keywords: string[]): string {
    const keywordPhrase = keywords.slice(0, 3).join(' ');
    return `Buy ${product.name} in Kenya. Quality ${keywordPhrase} with fast delivery and M-Pesa payment. ${product.description?.substring(0, 100) || 'Premium household products'}.`;
  }

  private generateMetaTitle(product: any): string {
    return `${product.name} - ${product.category?.name || 'Home Products'} Kenya | Household Planet`;
  }

  private generateImageAltText(product: any): string[] {
    const images = JSON.parse(product.images || '[]');
    return images.map((_, index) => 
      `${product.name} - ${product.category?.name || 'Home Product'} ${index + 1} - Kenya`
    );
  }

  private generateProductSchema(product: any) {
    return {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.name,
      "description": product.description,
      "sku": product.sku,
      "brand": product.brand?.name,
      "category": product.category?.name,
      "offers": {
        "@type": "Offer",
        "price": product.price,
        "priceCurrency": "KES",
        "availability": "https://schema.org/InStock"
      }
    };
  }

  private generateCategoryKeywords(category: any): string[] {
    const keywords = [
      category.name.toLowerCase(),
      `${category.name.toLowerCase()} kenya`,
      `buy ${category.name.toLowerCase()}`,
      `${category.name.toLowerCase()} nairobi`,
      'household items',
      'home products',
      'quality',
      'fast delivery',
      'm-pesa payment'
    ];

    // Add product-based keywords
    category.products.forEach(product => {
      keywords.push(...product.name.toLowerCase().split(' ').filter(w => w.length > 3));
    });

    return [...new Set(keywords)];
  }

  private generateCategoryContent(category: any, keywords: string[]): string {
    return `
      <h1>${category.name} - Premium Quality for Kenyan Homes</h1>
      <p>Discover our extensive collection of ${category.name.toLowerCase()} designed for modern Kenyan households. 
      From ${keywords.slice(0, 3).join(', ')} to premium accessories, we offer quality products with fast delivery across Kenya.</p>
      
      <h2>Why Choose Our ${category.name}?</h2>
      <ul>
        <li>Quality guaranteed products</li>
        <li>Fast delivery across Kenya</li>
        <li>Secure M-Pesa payments</li>
        <li>Competitive prices</li>
        <li>Customer support in English and Swahili</li>
      </ul>
      
      <h2>Popular ${category.name} Products</h2>
      <p>Browse our top-selling ${category.name.toLowerCase()} including ${category.products.slice(0, 3).map(p => p.name).join(', ')} and more.</p>
    `;
  }

  private generateCategorySchema(category: any) {
    return {
      "@context": "https://schema.org/",
      "@type": "CollectionPage",
      "name": category.name,
      "description": `${category.name} products for Kenyan homes`,
      "url": `/categories/${category.slug}`,
      "mainEntity": {
        "@type": "ItemList",
        "numberOfItems": category.products.length,
        "itemListElement": category.products.map((product, index) => ({
          "@type": "Product",
          "position": index + 1,
          "name": product.name,
          "url": `/products/${product.slug}`
        }))
      }
    };
  }
}