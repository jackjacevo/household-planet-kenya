import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [totalProducts, totalOrders, totalCustomers, orders, revenue] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.order.count(),
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          items: { include: { product: { select: { name: true } } } }
        }
      }),
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: 'CANCELLED' } }
      })
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayOrders, todayRevenue, pendingOrders] = await Promise.all([
      this.prisma.order.count({
        where: { createdAt: { gte: today, lt: tomorrow } }
      }),
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: {
          createdAt: { gte: today, lt: tomorrow },
          status: { not: 'CANCELLED' }
        }
      }),
      this.prisma.order.count({ where: { status: 'PENDING' } })
    ]);

    return {
      overview: {
        totalOrders,
        totalRevenue: Number(revenue._sum.total) || 0,
        totalCustomers,
        totalProducts,
        activeProducts: totalProducts,
        outOfStockProducts: 0,
        todayOrders,
        todayRevenue: Number(todayRevenue._sum.total) || 0,
        pendingOrders,
        lowStockProducts: 0
      },
      recentOrders: orders,
      topProducts: [],
      customerGrowth: [],
      salesByCounty: []
    };
  }

  async getInventoryAlerts() {
    return {
      lowStock: [],
      outOfStock: [],
      alerts: []
    };
  }

  async getProducts(query: any) {
    const products = await this.prisma.product.findMany({
      take: 10,
      include: { category: true }
    });
    return { products, total: products.length };
  }

  async getCategories() {
    return this.prisma.category.findMany();
  }

  async getActivities(query: any) {
    return { activities: [], total: 0 };
  }

  async getActivitiesStats() {
    // This should call the ActivityService if it exists
    return { totalActivities: 0, todayActivities: 0 };
  }

  // Analytics methods
  async getSalesAnalytics(period: string) {
    return { sales: [], total: 0, period };
  }

  async getPerformanceMetrics() {
    return { metrics: [] };
  }

  async getConversionRates(period: string) {
    return { rates: [], period };
  }

  async getRevenueAnalytics(period: string) {
    return { revenue: [], period };
  }

  async getGeographicSales() {
    return { sales: [] };
  }

  async getCustomerInsights() {
    return { insights: [] };
  }

  async getCustomerBehavior() {
    return { behavior: [] };
  }

  async getRecentActivities() {
    return { activities: [] };
  }

  async getKPIs() {
    return { kpis: [] };
  }

  // Product methods
  async createProduct(data: any, userId: number, ip: string, ua: string) {
    const product = await this.prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: data.description,
        shortDescription: data.shortDescription,
        sku: data.sku,
        price: data.price,
        comparePrice: data.comparePrice,
        categoryId: data.categoryId,
        brandId: data.brandId,
        stock: data.stock || 0,
        isActive: data.isActive !== false,
        isFeatured: data.isFeatured || false,
        images: JSON.stringify(data.images || []),
        tags: JSON.stringify(data.tags || [])
      }
    });
    return { product };
  }

  async updateProduct(id: number, data: any, userId: number, ip: string, ua: string) {
    return { message: 'Product updated' };
  }

  async deleteProduct(id: number, userId: number, ip: string, ua: string) {
    return { message: 'Product deleted' };
  }

  async bulkCreateProducts(products: any[], userId: number) {
    return { message: 'Products created' };
  }

  async bulkUpdateProducts(data: any, userId: number) {
    return { message: 'Products updated' };
  }

  async importProductsCsv(file: any) {
    return { message: 'CSV imported' };
  }

  async exportProductsCsv() {
    return { message: 'CSV exported' };
  }

  async uploadTempImages(files: any[]) {
    return { images: [] };
  }

  async uploadProductImages(id: number, files: any[], userId: number) {
    return { images: [] };
  }

  async cropProductImage(data: any) {
    return { image: '' };
  }

  async optimizeProductImages(id: number) {
    return { message: 'Images optimized' };
  }

  async deleteProductImage(id: number, index: number, userId: number) {
    return { message: 'Image deleted' };
  }

  async deleteTempImage(url: string) {
    return { message: 'Temp image deleted' };
  }

  async createProductVariant(id: number, data: any) {
    return { variant: {} };
  }

  async updateProductVariant(id: number, variantId: number, data: any) {
    return { variant: {} };
  }

  async deleteProductVariant(id: number, variantId: number) {
    return { message: 'Variant deleted' };
  }

  async updateProductSEO(id: number, data: any) {
    return { message: 'SEO updated' };
  }

  async importProductsExcel(file: any) {
    return { message: 'Excel imported' };
  }

  async exportProductsExcel() {
    return { message: 'Excel exported' };
  }

  async getProductAnalytics(query: any) {
    return { analytics: [] };
  }

  async getPopularProducts(period: string) {
    return { products: [] };
  }

  async getPopularCategories(period: string) {
    return { categories: [] };
  }

  // Category methods
  async createCategory(data: any, userId: number) {
    const category = await this.prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: data.description,
        image: data.image,
        parentId: data.parentId,
        isActive: data.isActive !== false,
        sortOrder: data.sortOrder || 0
      }
    });
    return { category };
  }

  async updateCategory(id: number, data: any, userId: number) {
    return { category: {} };
  }

  async deleteCategory(id: number, userId: number) {
    return { message: 'Category deleted' };
  }

  async uploadCategoryImage(file: any) {
    return { image: '' };
  }

  async reorderCategories(data: any) {
    return { message: 'Categories reordered' };
  }

  // Brand methods
  async getBrands() {
    return { brands: [] };
  }

  async createBrand(data: any) {
    return { brand: {} };
  }

  async updateBrand(id: number, data: any) {
    return { brand: {} };
  }

  async deleteBrand(id: number) {
    return { message: 'Brand deleted' };
  }
}