import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ContentManagementService } from './content-management.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('api/admin/content')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class ContentManagementController {
  constructor(private contentManagementService: ContentManagementService) {}

  // Homepage Content
  @Get('homepage')
  async getHomepageContent() {
    return this.contentManagementService.getHomepageContent();
  }

  @Put('homepage')
  async updateHomepageContent(@Body() data: any) {
    return this.contentManagementService.updateHomepageContent(data);
  }

  // Promotions
  @Get('promotions')
  async getPromotions() {
    return this.contentManagementService.getPromotions();
  }

  @Post('promotions')
  async createPromotion(@Body() data: any) {
    return this.contentManagementService.createPromotion(data);
  }

  @Put('promotions/:id')
  async updatePromotion(@Param('id') id: string, @Body() data: any) {
    return this.contentManagementService.updatePromotion(id, data);
  }

  // Email Templates
  @Get('email-templates')
  async getEmailTemplates() {
    return this.contentManagementService.getEmailTemplates();
  }

  @Post('email-templates')
  async createEmailTemplate(@Body() data: any) {
    return this.contentManagementService.createEmailTemplate(data);
  }

  @Put('email-templates/:id')
  async updateEmailTemplate(@Param('id') id: string, @Body() data: any) {
    return this.contentManagementService.updateEmailTemplate(id, data);
  }

  // Static Pages
  @Get('pages')
  async getStaticPages() {
    return this.contentManagementService.getStaticPages();
  }

  @Post('pages')
  async createStaticPage(@Body() data: any) {
    return this.contentManagementService.createStaticPage(data);
  }

  @Put('pages/:id')
  async updateStaticPage(@Param('id') id: string, @Body() data: any) {
    return this.contentManagementService.updateStaticPage(id, data);
  }

  // FAQs
  @Get('faqs')
  async getFAQs() {
    return this.contentManagementService.getFAQs();
  }

  @Post('faqs')
  async createFAQ(@Body() data: any) {
    return this.contentManagementService.createFAQ(data);
  }

  @Put('faqs/:id')
  async updateFAQ(@Param('id') id: string, @Body() data: any) {
    return this.contentManagementService.updateFAQ(id, data);
  }

  @Delete('faqs/:id')
  async deleteFAQ(@Param('id') id: string) {
    return this.contentManagementService.deleteFAQ(id);
  }

  // Blog Posts
  @Get('blog')
  async getBlogPosts() {
    return this.contentManagementService.getBlogPosts();
  }

  @Post('blog')
  async createBlogPost(@Body() data: any) {
    return this.contentManagementService.createBlogPost(data);
  }

  @Put('blog/:id')
  async updateBlogPost(@Param('id') id: string, @Body() data: any) {
    return this.contentManagementService.updateBlogPost(id, data);
  }

  @Delete('blog/:id')
  async deleteBlogPost(@Param('id') id: string) {
    return this.contentManagementService.deleteBlogPost(id);
  }

  // Content Search
  @Get('search')
  async searchContent(@Query('q') query: string, @Query('type') type?: string) {
    return this.contentManagementService.searchContent(query, type);
  }

  // Content Stats
  @Get('stats')
  async getContentStats() {
    return this.contentManagementService.getContentStats();
  }

  // Content Backup
  @Get('backup')
  async backupContent() {
    return this.contentManagementService.backupContent();
  }
}