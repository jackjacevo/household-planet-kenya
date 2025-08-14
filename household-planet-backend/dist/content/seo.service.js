"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeoService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SeoService = class SeoService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateProductAltText(productId) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            include: { category: true },
        });
        if (!product)
            return '';
        const altText = `${product.name} - ${product.category?.name || 'Product'} available at Household Planet Kenya`;
        if (product.images && Array.isArray(product.images)) {
            const updatedImages = product.images.map((image) => ({
                ...image,
                altText: image.altText || altText,
            }));
            await this.prisma.product.update({
                where: { id: productId },
                data: { images: JSON.stringify(updatedImages) },
            });
        }
        return altText;
    }
    async generateCategoryContent(categoryId) {
        const category = await this.prisma.category.findUnique({
            where: { id: categoryId },
            include: {
                products: {
                    take: 5,
                    select: { name: true, price: true },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!category)
            return null;
        const productNames = category.products.map(p => p.name).join(', ');
        const avgPrice = category.products.reduce((sum, p) => sum + p.price, 0) / category.products.length;
        const seoContent = {
            metaTitle: `${category.name} - Quality Products at Household Planet Kenya`,
            metaDescription: `Shop premium ${category.name.toLowerCase()} including ${productNames}. Starting from KSh ${Math.floor(avgPrice)}. Free delivery in Kenya.`,
            content: `
        <h1>${category.name} Collection</h1>
        <p>Discover our extensive range of ${category.name.toLowerCase()} at Household Planet Kenya. 
        We offer high-quality products including ${productNames} and many more.</p>
        
        <h2>Why Choose Our ${category.name}?</h2>
        <ul>
          <li>Premium quality products</li>
          <li>Competitive prices starting from KSh ${Math.floor(avgPrice)}</li>
          <li>Fast delivery across Kenya</li>
          <li>Excellent customer service</li>
        </ul>
        
        <h2>Popular ${category.name} Products</h2>
        <p>Browse our most popular items in this category and find exactly what you need.</p>
      `,
            keywords: [
                category.name.toLowerCase(),
                'kenya',
                'household',
                'quality',
                'delivery',
                ...productNames.split(', ').map(name => name.toLowerCase()),
            ],
        };
        await this.prisma.category.update({
            where: { id: categoryId },
            data: {
                metaDescription: seoContent.metaDescription,
            },
        });
        return seoContent;
    }
    async generateSitemap() {
        const [products, categories, blogPosts] = await Promise.all([
            this.prisma.product.findMany({
                select: { slug: true },
                where: { isActive: true },
            }),
            this.prisma.category.findMany({
                select: { slug: true },
            }),
            this.prisma.blogPost.findMany({
                select: { slug: true },
                where: { status: 'PUBLISHED' },
            }),
        ]);
        const baseUrl = process.env.FRONTEND_URL || 'https://householdplanet.co.ke';
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/products</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  ${categories.map(cat => `
  <url>
    <loc>${baseUrl}/categories/${cat.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
  ${products.map(product => `
  <url>
    <loc>${baseUrl}/products/${product.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
  ${blogPosts.map(post => `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('')}
</urlset>`;
        return sitemap;
    }
    async optimizeProductSEO(productId) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            include: {
                category: true,
                reviews: { take: 5, orderBy: { rating: 'desc' } },
            },
        });
        if (!product)
            return null;
        const avgRating = product.reviews.length > 0
            ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
            : 0;
        const seoData = {
            metaTitle: `${product.name} - KSh ${product.price} | Household Planet Kenya`,
            metaDescription: `Buy ${product.name} for KSh ${product.price}. ${product.description.substring(0, 120)}... Free delivery in Kenya.`,
            structuredData: {
                '@context': 'https://schema.org',
                '@type': 'Product',
                name: product.name,
                description: product.description,
                image: product.images,
                brand: 'Household Planet Kenya',
                offers: {
                    '@type': 'Offer',
                    price: product.price,
                    priceCurrency: 'KES',
                    availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                },
                aggregateRating: avgRating > 0 ? {
                    '@type': 'AggregateRating',
                    ratingValue: avgRating,
                    reviewCount: product.reviews.length,
                } : undefined,
            },
        };
        await this.prisma.product.update({
            where: { id: productId },
            data: {
                seoTitle: seoData.metaTitle,
                seoDescription: seoData.metaDescription,
            },
        });
        return seoData;
    }
};
exports.SeoService = SeoService;
exports.SeoService = SeoService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SeoService);
//# sourceMappingURL=seo.service.js.map