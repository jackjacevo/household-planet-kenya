import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateContentPageDto,
  UpdateContentPageDto,
  CreateBannerDto,
  UpdateBannerDto,
  CreateEmailTemplateDto,
  UpdateEmailTemplateDto,
  CreateFAQDto,
  UpdateFAQDto,
  CreateBlogPostDto,
  UpdateBlogPostDto,
} from './dto/content.dto';

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  // Content Pages
  async createPage(data: CreateContentPageDto) {
    return this.prisma.contentPage.create({ data });
  }

  async getPages() {
    return this.prisma.contentPage.findMany({
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getPageBySlug(slug: string) {
    const page = await this.prisma.contentPage.findUnique({
      where: { slug },
    });
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  async updatePage(id: number, data: UpdateContentPageDto) {
    return this.prisma.contentPage.update({
      where: { id },
      data,
    });
  }

  async deletePage(id: number) {
    return this.prisma.contentPage.delete({ where: { id } });
  }

  // Banners
  async createBanner(data: CreateBannerDto) {
    return this.prisma.banner.create({
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });
  }

  async getBanners(position?: string) {
    return this.prisma.banner.findMany({
      where: {
        isActive: true,
        ...(position && { position }),
        OR: [
          { startDate: null },
          { startDate: { lte: new Date() } },
        ],
        AND: [
          {
            OR: [
              { endDate: null },
              { endDate: { gte: new Date() } },
            ],
          },
        ],
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getAllBanners() {
    return this.prisma.banner.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateBanner(id: number, data: UpdateBannerDto) {
    return this.prisma.banner.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });
  }

  async deleteBanner(id: number) {
    return this.prisma.banner.delete({ where: { id } });
  }

  // Email Templates
  async createEmailTemplate(data: CreateEmailTemplateDto) {
    return this.prisma.emailTemplate.create({ data });
  }

  async getEmailTemplates() {
    return this.prisma.emailTemplate.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getEmailTemplate(name: string) {
    const template = await this.prisma.emailTemplate.findUnique({
      where: { name },
    });
    if (!template) throw new NotFoundException('Template not found');
    return template;
  }

  async updateEmailTemplate(id: number, data: UpdateEmailTemplateDto) {
    return this.prisma.emailTemplate.update({
      where: { id },
      data,
    });
  }

  async deleteEmailTemplate(id: number) {
    return this.prisma.emailTemplate.delete({ where: { id } });
  }

  // FAQs
  async createFAQ(data: CreateFAQDto) {
    return this.prisma.fAQ.create({ data });
  }

  async getFAQs(category?: string) {
    return this.prisma.fAQ.findMany({
      where: {
        isPublished: true,
        ...(category && { category }),
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getAllFAQs() {
    return this.prisma.fAQ.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateFAQ(id: number, data: UpdateFAQDto) {
    return this.prisma.fAQ.update({
      where: { id },
      data,
    });
  }

  async deleteFAQ(id: number) {
    return this.prisma.fAQ.delete({ where: { id } });
  }



  async getFAQCategories() {
    const categories = await this.prisma.fAQ.findMany({
      where: { isPublished: true, category: { not: null } },
      select: { category: true },
      distinct: ['category'],
    });
    return categories.map(c => c.category);
  }

  // Blog Posts
  async createBlogPost(data: CreateBlogPostDto) {
    return this.prisma.blogPost.create({ data });
  }

  async getBlogPosts(published?: boolean) {
    return this.prisma.blogPost.findMany({
      where: published !== undefined ? { isPublished: published } : {},
      orderBy: { publishedAt: 'desc' },
    });
  }

  async getBlogPostBySlug(slug: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { slug },
    });
    if (!post) throw new NotFoundException('Blog post not found');
    return post;
  }

  async updateBlogPost(id: number, data: UpdateBlogPostDto) {
    return this.prisma.blogPost.update({
      where: { id },
      data: {
        ...data,
        publishedAt: data.isPublished && !data.publishedAt ? new Date() : data.publishedAt ? new Date(data.publishedAt) : undefined,
      },
    });
  }

  async deleteBlogPost(id: number) {
    return this.prisma.blogPost.delete({ where: { id } });
  }
}