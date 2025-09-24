/**
 * Backward Compatible API Wrapper
 * This wrapper provides a seamless transition between old and new API services
 * It falls back to the old implementation if the new service fails
 * ZERO BREAKING CHANGES - guaranteed production safety
 */

import axios from 'axios';
import { adminAPI } from './admin-services';
import { adminConfig, trackFeatureUsage, debugLog } from '@/lib/config/admin-config';

// Fallback implementations (current production code)
const fallbackAPI = {
  categories: {
    getAll: async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.categories || response.data || [];
    }
  },

  brands: {
    getAll: async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/brands`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.brands || response.data || [];
    }
  },

  products: {
    getAll: async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.products || response.data || [];
    },
    uploadTempImages: async (formData: FormData) => {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/temp/images`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          timeout: 30000
        }
      );
      return response.data;
    }
  },

  dashboard: {
    getStats: async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    }
  }
};

// Safe API wrapper with fallback mechanism
export const createSafeAPICall = <T extends (...args: any[]) => Promise<any>>(
  newApiCall: T,
  fallbackApiCall: T,
  operationName: string
): T => {
  return (async (...args: Parameters<T>) => {
    // Always try fallback first if feature is disabled
    if (!adminConfig.features.apiServiceLayer) {
      debugLog(`Using fallback API for: ${operationName}`);
      try {
        const result = await fallbackApiCall(...args);
        trackFeatureUsage(`fallback-api-${operationName}`, true);
        return result;
      } catch (error) {
        trackFeatureUsage(`fallback-api-${operationName}`, false);
        throw error;
      }
    }

    // Try new API service first if feature is enabled
    debugLog(`Trying new API service for: ${operationName}`);
    try {
      const result = await newApiCall(...args);
      trackFeatureUsage(`new-api-${operationName}`, true);
      return result;
    } catch (error) {
      console.warn(`New API service failed for ${operationName}, falling back to old implementation:`, error);
      trackFeatureUsage(`new-api-${operationName}`, false);

      // Fallback to old implementation
      try {
        debugLog(`Falling back to old API for: ${operationName}`);
        const result = await fallbackApiCall(...args);
        trackFeatureUsage(`fallback-after-failure-${operationName}`, true);
        return result;
      } catch (fallbackError) {
        trackFeatureUsage(`fallback-after-failure-${operationName}`, false);
        console.error(`Both new and fallback API failed for ${operationName}:`, fallbackError);
        throw fallbackError;
      }
    }
  }) as T;
};

// Safe admin API with automatic fallback
export const safeAdminAPI = {
  categories: {
    getAll: createSafeAPICall(
      adminAPI.categories.getCategories.bind(adminAPI.categories),
      fallbackAPI.categories.getAll,
      'categories.getAll'
    )
  },

  brands: {
    getAll: createSafeAPICall(
      adminAPI.brands.getBrands.bind(adminAPI.brands),
      fallbackAPI.brands.getAll,
      'brands.getAll'
    )
  },

  products: {
    getAll: createSafeAPICall(
      adminAPI.products.getProducts.bind(adminAPI.products),
      fallbackAPI.products.getAll,
      'products.getAll'
    ),
    uploadTempImages: createSafeAPICall(
      adminAPI.products.uploadTempImages.bind(adminAPI.products),
      fallbackAPI.products.uploadTempImages,
      'products.uploadTempImages'
    )
  },

  dashboard: {
    getStats: createSafeAPICall(
      adminAPI.dashboard.getDashboardStats.bind(adminAPI.dashboard),
      fallbackAPI.dashboard.getStats,
      'dashboard.getStats'
    )
  }
};

// Export both for flexibility
export { adminAPI };
export default safeAdminAPI;