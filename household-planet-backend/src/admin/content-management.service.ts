import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContentManagementService {
  constructor(private prisma: PrismaService) {}

  // Homepage Content Management
  async getHomepageContent() {
    return this.prisma.$queryRaw`
      SELECT * FROM content WHERE type = 'homepage' ORDER BY sort_order ASC
    `;
  }

  async updateHomepageContent(data: any) {
    const { banners, sections } = data;
    
    // Update banners
    for (const banner of banners || []) {
      await this.upsertContent('homepage_banner', banner.id, {
        title: banner.title,
        subtitle: banner.subtitle,
        image: banner.image,
        link: banner.link,
        isActive: banner.isActive,
        sortOrder: banner.sortOrder
      });
    }

    // Update sections
    for (const section of sections || []) {
      await this.upsertContent('homepage_section', section.id, {
        title: section.title,
        content: section.content,
        type: section.type,
        isActive: section.isActive,
        sortOrder: section.sortOrder
      });
    }

    return { success: true };
  }

  // Promotional Content
  async getPromotions() {
    return this.prisma.$queryRaw`
      SELECT * FROM content WHERE type = 'promotion' ORDER BY created_at DESC
    `;
  }

  async createPromotion(data: any) {
    return this.upsertContent('promotion', null, {
      title: data.title,
      content: data.content,
      image: data.image,
      startDate: data.startDate,
      endDate: data.endDate,
      isActive: data.isActive,
      targetAudience: data.targetAudience
    });
  }

  async updatePromotion(id: string, data: any) {
    return this.upsertContent('promotion', id, data);
  }

  // Email Templates
  async getEmailTemplates() {
    return this.prisma.$queryRaw`
      SELECT * FROM content WHERE type = 'email_template' ORDER BY name ASC
    `;
  }

  async createEmailTemplate(data: any) {
    return this.upsertContent('email_template', null, {
      name: data.name,
      subject: data.subject,
      content: data.content,
      variables: JSON.stringify(data.variables || []),
      isActive: data.isActive
    });
  }

  async updateEmailTemplate(id: string, data: any) {
    return this.upsertContent('email_template', id, {
      ...data,
      variables: JSON.stringify(data.variables || [])
    });
  }

  // Static Pages
  async getStaticPages() {
    return this.prisma.$queryRaw`
      SELECT * FROM content WHERE type = 'static_page' ORDER BY name ASC
    `;
  }

  async createStaticPage(data: any) {
    return this.upsertContent('static_page', null, {
      name: data.name,
      slug: data.slug,
      title: data.title,
      content: data.content,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      isActive: data.isActive
    });
  }

  async updateStaticPage(id: string, data: any) {
    return this.upsertContent('static_page', id, data);
  }

  // FAQ Management
  async getFAQs() {
    return this.prisma.$queryRaw`
      SELECT * FROM content WHERE type = 'faq' ORDER BY sort_order ASC, created_at DESC
    `;
  }

  async createFAQ(data: any) {
    return this.upsertContent('faq', null, {
      question: data.question,
      answer: data.answer,
      category: data.category,
      sortOrder: data.sortOrder || 0,
      isActive: data.isActive
    });
  }

  async updateFAQ(id: string, data: any) {
    return this.upsertContent('faq', id, data);
  }

  async deleteFAQ(id: string) {
    return this.prisma.$executeRaw`DELETE FROM content WHERE id = ${id} AND type = 'faq'`;
  }

  // Blog/News Management
  async getBlogPosts() {
    return this.prisma.$queryRaw`
      SELECT * FROM content WHERE type = 'blog_post' ORDER BY created_at DESC
    `;
  }

  async createBlogPost(data: any) {
    return this.upsertContent('blog_post', null, {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      image: data.image,
      author: data.author,
      tags: JSON.stringify(data.tags || []),
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      publishedAt: data.publishedAt,
      isActive: data.isActive
    });
  }

  async updateBlogPost(id: string, data: any) {
    return this.upsertContent('blog_post', id, {
      ...data,
      tags: JSON.stringify(data.tags || [])
    });
  }

  async deleteBlogPost(id: string) {
    return this.prisma.$executeRaw`DELETE FROM content WHERE id = ${id} AND type = 'blog_post'`;
  }

  // Generic content management
  private async upsertContent(type: string, id: string | null, data: any) {
    const contentData = {
      type,
      data: JSON.stringify(data),
      updatedAt: new Date()
    };

    if (id) {
      return this.prisma.$executeRaw`
        UPDATE content SET 
          data = ${contentData.data},
          updated_at = ${contentData.updatedAt}
        WHERE id = ${id} AND type = ${type}
      `;
    } else {
      const newId = this.generateId();
      return this.prisma.$executeRaw`
        INSERT INTO content (id, type, data, created_at, updated_at)
        VALUES (${newId}, ${type}, ${contentData.data}, ${new Date()}, ${contentData.updatedAt})
      `;
    }
  }

  // Content search and filtering
  async searchContent(query: string, type?: string) {
    let sql = `SELECT * FROM content WHERE data LIKE '%${query}%'`;
    if (type) {
      sql += ` AND type = '${type}'`;
    }
    sql += ` ORDER BY updated_at DESC`;
    
    return this.prisma.$queryRawUnsafe(sql);
  }

  // Content backup and restore
  async backupContent() {
    return this.prisma.$queryRaw`SELECT * FROM content ORDER BY type, created_at`;
  }

  async getContentStats() {
    const stats = await this.prisma.$queryRaw`
      SELECT 
        type,
        COUNT(*) as count,
        MAX(updated_at) as last_updated
      FROM content 
      GROUP BY type
    `;

    return stats;
  }

  private generateId(): string {
    return 'cnt_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}