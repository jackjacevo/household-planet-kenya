/**
 * Standardized Error Handling Utility
 * Provides consistent error handling and user-friendly messages across the admin panel
 * Built with backward compatibility and production safety
 */

import { adminConfig, trackFeatureUsage, debugLog } from '@/lib/config/admin-config';

// Error types for better categorization
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN'
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'LOW',        // Minor issues, user can continue
  MEDIUM = 'MEDIUM',  // Requires attention, but not blocking
  HIGH = 'HIGH',      // Blocking issues, user cannot proceed
  CRITICAL = 'CRITICAL' // System-level issues
}

// Standardized error interface
export interface AppError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  originalError: any;
  context?: string;
  timestamp: Date;
  userMessage: string;
}

// Network connectivity checker
const isNetworkError = (error: any): boolean => {
  if (!error) return false;

  // Check various network error indicators
  const networkIndicators = [
    'Network Error',
    'ERR_NETWORK',
    'ERR_INTERNET_DISCONNECTED',
    'NETWORK_ERROR',
    'fetch is not defined',
    'Failed to fetch'
  ];

  const errorString = String(error.message || error.code || error.name || '').toUpperCase();
  return networkIndicators.some(indicator => errorString.includes(indicator.toUpperCase()));
};

// Authentication error checker
const isAuthError = (error: any): boolean => {
  if (!error) return false;

  const status = error.response?.status || error.status;
  const message = String(error.message || error.response?.data?.message || '').toLowerCase();

  return status === 401 ||
         status === 403 ||
         message.includes('unauthorized') ||
         message.includes('forbidden') ||
         message.includes('authentication required');
};

// Validation error checker
const isValidationError = (error: any): boolean => {
  if (!error) return false;

  const status = error.response?.status || error.status;
  const message = String(error.message || error.response?.data?.message || '').toLowerCase();

  return status === 400 ||
         status === 422 ||
         message.includes('validation') ||
         message.includes('invalid') ||
         error.response?.data?.errors; // Common validation error structure
};

// Server error checker
const isServerError = (error: any): boolean => {
  if (!error) return false;

  const status = error.response?.status || error.status;
  return status >= 500 && status < 600;
};

// Determine error type from error object
const determineErrorType = (error: any): ErrorType => {
  if (isNetworkError(error)) return ErrorType.NETWORK;
  if (isAuthError(error)) return ErrorType.AUTHENTICATION;
  if (isValidationError(error)) return ErrorType.VALIDATION;
  if (isServerError(error)) return ErrorType.SERVER;
  return ErrorType.UNKNOWN;
};

// Determine error severity
const determineErrorSeverity = (errorType: ErrorType, error: any): ErrorSeverity => {
  switch (errorType) {
    case ErrorType.AUTHENTICATION:
      return ErrorSeverity.HIGH; // Blocks user from proceeding

    case ErrorType.NETWORK:
      return ErrorSeverity.MEDIUM; // User can retry

    case ErrorType.SERVER:
      return ErrorSeverity.HIGH; // System issue, user cannot proceed

    case ErrorType.VALIDATION:
      return ErrorSeverity.LOW; // User can fix and retry

    default:
      return ErrorSeverity.MEDIUM;
  }
};

// Generate user-friendly error messages
const generateUserMessage = (errorType: ErrorType, error: any, context?: string): string => {
  const contextPrefix = context ? `${context}: ` : '';

  switch (errorType) {
    case ErrorType.NETWORK:
      return `${contextPrefix}Connection issue. Please check your internet connection and try again.`;

    case ErrorType.AUTHENTICATION:
      return `${contextPrefix}Authentication failed. Please log in again.`;

    case ErrorType.VALIDATION:
      const validationMsg = error.response?.data?.message || error.message;
      if (validationMsg && typeof validationMsg === 'string') {
        return `${contextPrefix}${validationMsg}`;
      }
      return `${contextPrefix}Please check your input and try again.`;

    case ErrorType.SERVER:
      return `${contextPrefix}Server error. Please try again later or contact support.`;

    default:
      // Try to extract meaningful message from error
      const errorMsg = error.response?.data?.message || error.message;
      if (errorMsg && typeof errorMsg === 'string' && errorMsg.length < 100) {
        return `${contextPrefix}${errorMsg}`;
      }
      return `${contextPrefix}An unexpected error occurred. Please try again.`;
  }
};

// Main error processor
export const processError = (error: any, context?: string): AppError => {
  try {
    const errorType = determineErrorType(error);
    const severity = determineErrorSeverity(errorType, error);
    const userMessage = generateUserMessage(errorType, error, context);

    const processedError: AppError = {
      type: errorType,
      severity,
      message: error.message || 'Unknown error',
      originalError: error,
      context,
      timestamp: new Date(),
      userMessage
    };

    // Track error for analytics
    trackFeatureUsage('error-processing', true, `${errorType}-${severity}`);
    debugLog('Error processed:', processedError);

    return processedError;
  } catch (processingError) {
    // Fallback if error processing itself fails
    trackFeatureUsage('error-processing', false, 'processing-failed');
    debugLog('Error processing failed:', processingError);

    return {
      type: ErrorType.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      message: 'Error processing failed',
      originalError: error,
      context,
      timestamp: new Date(),
      userMessage: context ? `${context}: An error occurred. Please try again.` : 'An error occurred. Please try again.'
    };
  }
};

// Extract simple error message for backward compatibility
export const getErrorMessage = (error: any, context?: string): string => {
  try {
    const processedError = processError(error, context);
    return processedError.userMessage;
  } catch (e) {
    // Ultra-safe fallback
    const message = error?.response?.data?.message || error?.message || 'Unknown error';
    return context ? `${context}: ${message}` : message;
  }
};

// Log error for debugging/monitoring
export const logError = (error: AppError | any, additionalContext?: any) => {
  if (adminConfig.debug) {
    console.group('🚨 Error Details');
    console.error('Error:', error);
    if (additionalContext) {
      console.log('Additional Context:', additionalContext);
    }
    console.groupEnd();
  }

  // In production, you might want to send to error monitoring service
  // Example: Sentry.captureException(error, { extra: additionalContext });
};

// Check if should retry based on error type
export const shouldRetry = (error: AppError): boolean => {
  switch (error.type) {
    case ErrorType.NETWORK:
      return true; // Network issues can be transient

    case ErrorType.SERVER:
      return error.originalError.response?.status >= 500; // Retry server errors

    default:
      return false; // Don't retry auth or validation errors
  }
};

// Get retry delay (exponential backoff)
export const getRetryDelay = (attemptNumber: number, baseDelay = 1000): number => {
  return Math.min(baseDelay * Math.pow(2, attemptNumber), 30000);
};

export default {
  processError,
  getErrorMessage,
  logError,
  shouldRetry,
  getRetryDelay,
  ErrorType,
  ErrorSeverity
};