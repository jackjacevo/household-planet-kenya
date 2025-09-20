// Error handling utilities for consistent error management

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export class ApiErrorHandler {
  static handleApiError(error: any): ApiError {
    // Handle different error types
    if (error?.response) {
      // Axios error with response
      return {
        message: error.response.data?.message || 'An error occurred',
        status: error.response.status,
        code: error.response.data?.code
      };
    } else if (error?.message) {
      // Standard Error object
      return {
        message: error.message,
        code: error.code
      };
    } else if (typeof error === 'string') {
      // String error
      return {
        message: error
      };
    } else {
      // Unknown error type
      return {
        message: 'An unexpected error occurred'
      };
    }
  }

  static logError(error: any, context?: string) {
    const apiError = this.handleApiError(error);
    console.error(`[${context || 'API'}] Error:`, apiError);
    return apiError;
  }
}

// Safe array operations
export const safeArray = <T>(value: any): T[] => {
  return Array.isArray(value) ? value : [];
};

// Safe object access
export const safeGet = (obj: any, path: string, defaultValue: any = null) => {
  try {
    return path.split('.').reduce((current, key) => current?.[key], obj) ?? defaultValue;
  } catch {
    return defaultValue;
  }
};

// API response normalizer
export const normalizeApiResponse = (response: any) => {
  // Handle different response structures
  if (Array.isArray(response)) {
    return { data: response, success: true };
  }
  
  if (response?.data) {
    return { data: response.data, success: true, ...response };
  }
  
  if (response?.products) {
    return { data: response.products, success: true, ...response };
  }
  
  return { data: response, success: true };
};