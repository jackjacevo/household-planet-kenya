import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContentManagementService {
  constructor(private prisma: PrismaService) {}

  // Homepage Content Management
  async getHomepageContent() {
    // Use existing Page model for homepage content
    return this.prisma.page.findMany({
      where: { slug: { startsWith: 'homepage' } },
      orderBy: { createdAt: 'asc' }
    });
  }

  async updateHomepageContent(data: any) {
    const { title, content, seoTitle, seoDescription } = data;
    
    return this.prisma.page.upsert({
      where: { slug: 'homepage' },
      update: {
        title: title || 'Homepage',
        content: content || '',
        seoTitle,
        seoDescription,
        updatedAt: new Date()
      },
      create: {
        title: title || 'Homepage',
        slug: 'homepage',
        content: content || '',
        seoTitle,
        seoDescription,
        isActive: true
      }
    });
  }

  // Promotional Content using BlogPost model
  async getPromotions() {
    return this.prisma.blogPost.findMany({
      where: { tags: { contains: 'promotion' } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createPromotion(data: any) {
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return this.prisma.blogPost.create({
      data: {
        title: data.title,
        slug: `promo-${slug}-${Date.now()}`,
        content: data.content,
        featuredImage: data.image,
        tags: 'promotion',
        status: data.isActive ? 'PUBLISHED' : 'DRAFT',
        publishedAt: data.isActive ? new Date() : null
      }
    });
  }

  async updatePromotion(id: string, data: any) {
    return this.prisma.blogPost.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        featuredImage: data.image,
        status: data.isActive ? 'PUBLISHED' : 'DRAFT',
        publishedAt: data.isActive && !data.publishedAt ? new Date() : data.publishedAt
      }
    });
  }

  // Email Templates using Page model
  async getEmailTemplates() {
    return this.prisma.page.findMany({
      where: { slug: { startsWith: 'email-template' } },
      orderBy: { title: 'asc' }
    });
  }

  async createEmailTemplate(data: any) {
    const slug = `email-template-${data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    return this.prisma.page.create({
      data: {
        title: data.name,
        slug,
        content: data.content,
        seoTitle: data.subject,
        seoDescription: `Email template: ${data.name}`,
        isActive: data.isActive
      }
    });
  }

  async updateEmailTemplate(id: string, data: any) {
    return this.prisma.page.update({
      where: { id },
      data: {
        title: data.name,
        content: data.content,
        seoTitle: data.subject,
        isActive: data.isActive
      }
    });
  }

  // Static Pages
  async getStaticPages() {
    return this.prisma.page.findMany({
      where: { 
        slug: { 
          notIn: ['homepage', 'email-template'] 
        } 
      },
      orderBy: { title: 'asc' }
    });
  }

  async createStaticPage(data: any) {
    return this.prisma.page.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        seoTitle: data.metaTitle,
        seoDescription: data.metaDescription,
        isActive: data.isActive
      }
    });
  }

  async updateStaticPage(id: string, data: any) {
    return this.prisma.page.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        seoTitle: data.metaTitle,
        seoDescription: data.metaDescription,
        isActive: data.isActive
      }
    });
  }

  // FAQ Management
  async getFAQs() {
    return this.prisma.fAQ.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }]
    });
  }

  async createFAQ(data: any) {
    return this.prisma.fAQ.create({
      data: {
        question: data.question,
        answer: data.answer,
        category: data.category,
        sortOrder: data.sortOrder || 0,
        isActive: data.isActive
      }
    });
  }

  async updateFAQ(id: string, data: any) {
    return this.prisma.fAQ.update({
      where: { id },
      data: {
        question: data.question,
        answer: data.answer,
        category: data.category,
        sortOrder: data.sortOrder,
        isActive: data.isActive
      }
    });
  }

  async deleteFAQ(id: string) {
    return this.prisma.fAQ.delete({ where: { id } });
  }

  // Blog/News Management
  async getBlogPosts() {
    return this.prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async createBlogPost(data: any) {
    return this.prisma.blogPost.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        featuredImage: data.image,
        authorId: data.author,
        tags: Array.isArray(data.tags) ? data.tags.join(',') : data.tags,
        seoTitle: data.metaTitle,
        seoDescription: data.metaDescription,
        publishedAt: data.publishedAt,
        status: data.isActive ? 'PUBLISHED' : 'DRAFT'
      }
    });
  }

  async updateBlogPost(id: string, data: any) {
    return this.prisma.blogPost.update({
      where: { id },
      data: {
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        featuredImage: data.image,
        tags: Array.isArray(data.tags) ? data.tags.join(',') : data.tags,
        seoTitle: data.metaTitle,
        seoDescription: data.metaDescription,
        status: data.isActive ? 'PUBLISHED' : 'DRAFT'
      }
    });
  }

  async deleteBlogPost(id: string) {
    return this.prisma.blogPost.delete({ where: { id } });
  }

  // Content search and filtering
  async searchContent(query: string, type?: string) {
    const results = [];
    
    // Search pages
    if (!type || type === 'page') {
      const pages = await this.prisma.page.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { content: { contains: query } }
          ]
        }
      });
      results.push(...pages.map(p => ({ ...p, type: 'page' })));
    }
    
    // Search blog posts
    if (!type || type === 'blog') {
      const posts = await this.prisma.blogPost.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { content: { contains: query } }
          ]
        }
      });
      results.push(...posts.map(p => ({ ...p, type: 'blog' })));
    }
    
    // Search FAQs
    if (!type || type === 'faq') {
      const faqs = await this.prisma.fAQ.findMany({
        where: {
          OR: [
            { question: { contains: query } },
            { answer: { contains: query } }
          ]
        }
      });
      results.push(...faqs.map(f => ({ ...f, type: 'faq' })));
    }
    
    return results;
  }

  // Content backup and restore
  async backupContent() {
    const [pages, posts, faqs] = await Promise.all([
      this.prisma.page.findMany({ orderBy: { createdAt: 'asc' } }),
      this.prisma.blogPost.findMany({ orderBy: { createdAt: 'asc' } }),
      this.prisma.fAQ.findMany({ orderBy: { createdAt: 'asc' } })
    ]);
    
    return {
      pages,
      posts,
      faqs
    };
  }

  async getContentStats() {
    const [pageCount, postCount, faqCount] = await Promise.all([
      this.prisma.page.count(),
      this.prisma.blogPost.count(),
      this.prisma.fAQ.count()
    ]);
    
    return {
      pages: { count: pageCount, type: 'page' },
      posts: { count: postCount, type: 'blog' },
      faqs: { count: faqCount, type: 'faq' }
    };
  }
}