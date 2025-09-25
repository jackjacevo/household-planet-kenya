/**
 * Admin API Services Layer
 * Centralizes all admin API calls with consistent error handling
 * Uses secureApiClient for authentication and security
 * Provides fallback mechanisms for production safety
 */

import { secureApiClient } from '@/lib/secure-api';
import { adminConfig, trackFeatureUsage, debugLog } from '@/lib/config/admin-config';

// Types for better type safety
interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success?: boolean;
}

interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Base API service with error handling
class BaseApiService {
  protected async handleRequest<T>(
    requestFn: () => Promise<any>,
    context: string
  ): Promise<T> {
    try {
      debugLog(`API Request: ${context}`);
      const response = await requestFn();
      trackFeatureUsage('api-service-layer', true, context);
      debugLog(`API Success: ${context}`, response.data);
      return response.data;
    } catch (error) {
      trackFeatureUsage('api-service-layer', false, context);
      debugLog(`API Error: ${context}`, error);
      throw error;
    }
  }
}

// Products API Service
class ProductsApiService extends BaseApiService {
  async getProducts(): Promise<any[]> {
    return this.handleRequest(
      () => secureApiClient.get('/products'),
      'products.getAll'
    );
  }

  async getProduct(id: number): Promise<any> {
    return this.handleRequest(
      () => secureApiClient.get(`/products/${id}`),
      'products.getOne'
    );
  }

  async createProduct(data: any): Promise<any> {
    return this.handleRequest(
      () => secureApiClient.post('/products', data),
      'products.create'
    );
  }

  async updateProduct(id: number, data: any): Promise<any> {
    return this.handleRequest(
      () => secureApiClient.put(`/products/${id}`, data),
      'products.update'
    );
  }

  async deleteProduct(id: number): Promise<void> {
    return this.handleRequest(
      () => secureApiClient.delete(`/products/${id}`),
      'products.delete'
    );
  }

  async bulkDeleteProducts(productIds: number[]): Promise<any> {
    return this.handleRequest(
      () => secureApiClient.post('/products/bulk-delete', { productIds }),
      'products.bulkDelete'
    );
  }

  async uploadTempImages(formData: FormData): Promise<{ images: string[]; success: boolean; message: string }> {
    return this.handleRequest(
      () => secureApiClient.post('/products/temp/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000
      }),
      'products.uploadTempImages'
    );
  }
}

// Categories API Service
class CategoriesApiService extends BaseApiService {
  async getCategories(): Promise<any[]> {
    return this.handleRequest(
      () => secureApiClient.get('/categories'),
      'categories.getAll'
    );
  }

  async getCategory(id: number): Promise<any> {
    return this.handleRequest(
      () => secureApiClient.get(`/categories/${id}`),
      'categories.getOne'
    );
  }

  async createCategory(data: any): Promise<any> {
    return this.handleRequest(
      () => secureApiClient.post('/categories', data),
      'categories.create'
    );
  }

  async updateCategory(id: number, data: any): Promise<any> {
    return this.handleRequest(
      () => secureApiClient.put(`/categories/${id}`, data),
      'categories.update'
    );
  }

  async deleteCategory(id: number): Promise<void> {
    return this.handleRequest(
      () => secureApiClient.delete(`/categories/${id}`),
      'categories.delete'
    );
  }

  async uploadCategoryImage(formData: FormData): Promise<{ url: string }> {
    return this.handleRequest(
      () => secureApiClient.post('/categories/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }),
      'categories.uploadImage'
    );
  }
}

// Brands API Service
class BrandsApiService extends BaseApiService {
  async getBrands(): Promise<any[]> {
    return this.handleRequest(
      () => secureApiClient.get('/brands'),
      'brands.getAll'
    );
  }

  async getBrand(id: number): Promise<any> {
    return this.handleRequest(
      () => secureApiClient.get(`/brands/${id}`),
      'brands.getOne'
    );
  }

  async createBrand(data: any): Promise<any> {
    return this.handleRequest(
      () => secureApiClient.post('/brands', data),
      'brands.create'
    );
  }

  async updateBrand(id: number, data: any): Promise<any> {
    return this.handleRequest(
      () => secureApiClient.put(`/brands/${id}`, data),
      'brands.update'
    );
  }

  async deleteBrand(id: number): Promise<void> {
    return this.handleRequest(
      () => secureApiClient.delete(`/brands/${id}`),
      'brands.delete'
    );
  }
}

// Orders API Service
class OrdersApiService extends BaseApiService {
  async getOrders(params?: any): Promise<PaginatedResponse> {
    const queryParams = new URLSearchParams(params || {});
    return this.handleRequest(
      () => secureApiClient.get(`/orders?${queryParams}`),
      'orders.getAll'
    );
  }

  async getOrderStats(): Promise<any> {
    return this.handleRequest(
      () => secureApiClient.get('/orders/admin/stats'),
      'orders.getStats'
    );
  }

  async updateOrderStatus(id: number, data: { status: string; notes?: string }): Promise<any> {
    return this.handleRequest(
      () => secureApiClient.put(`/orders/${id}/status`, data),
      'orders.updateStatus'
    );
  }

  async deleteOrder(id: number): Promise<void> {
    return this.handleRequest(
      () => secureApiClient.post(`/orders/delete/${id}`),
      'orders.delete'
    );
  }

  async bulkDeleteOrders(orderIds: number[]): Promise<any> {
    return this.handleRequest(
      () => secureApiClient.post('/orders/bulk/delete', { orderIds }),
      'orders.bulkDelete'
    );
  }
}

// Dashboard API Service
class DashboardApiService extends BaseApiService {
  async getDashboardStats(): Promise<any> {
    return this.handleRequest(
      () => secureApiClient.get(`${process.env.NEXT_PUBLIC_API_URL}/dashboard`),
      'dashboard.getStats'
    );
  }
}

// Create service instances
const productsApi = new ProductsApiService();
const categoriesApi = new CategoriesApiService();
const brandsApi = new BrandsApiService();
const ordersApi = new OrdersApiService();
const dashboardApi = new DashboardApiService();

// Main admin API object
export const adminAPI = {
  products: productsApi,
  categories: categoriesApi,
  brands: brandsApi,
  orders: ordersApi,
  dashboard: dashboardApi,
};

// Backward compatibility wrapper
// This allows gradual migration from old API calls
export const createApiWrapper = <T extends (...args: any[]) => Promise<any>>(
  newApiCall: T,
  fallbackApiCall: T,
  featureFlag: string
): T => {
  return ((...args: Parameters<T>) => {
    if (adminConfig.features.apiServiceLayer) {
      debugLog(`Using new API service for: ${featureFlag}`);
      return newApiCall(...args);
    } else {
      debugLog(`Using fallback API for: ${featureFlag}`);
      return fallbackApiCall(...args);
    }
  }) as T;
};

export default adminAPI;