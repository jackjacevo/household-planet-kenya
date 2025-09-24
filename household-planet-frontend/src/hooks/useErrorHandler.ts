/**
 * Error Handling Hook for React Components
 * Provides a consistent way to handle errors across admin components
 * Includes automatic toast notifications and error tracking
 */

import { useCallback } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { processError, logError, AppError, ErrorType, ErrorSeverity, getErrorMessage } from '@/lib/utils/error-handler';
import { adminConfig, trackFeatureUsage, debugLog, isFeatureEnabled } from '@/lib/config/admin-config';

// Hook options
interface ErrorHandlerOptions {
  showToast?: boolean;           // Show toast notification (default: true)
  logError?: boolean;           // Log error for debugging (default: true)
  context?: string;             // Context for error messages
  fallbackToOldHandler?: boolean; // Fallback to simple error handling (default: true)
}

// Error handler hook
export const useErrorHandler = (options: ErrorHandlerOptions = {}) => {
  const { showToast } = useToast();

  const {
    showToast: shouldShowToast = true,
    logError: shouldLogError = true,
    context,
    fallbackToOldHandler = true
  } = options;

  // Main error handler function
  const handleError = useCallback((error: any, customContext?: string) => {
    const errorContext = customContext || context || 'Operation';

    try {
      // Use new error handling if feature is enabled
      if (isFeatureEnabled('improvedValidation')) {
        debugLog(`Using new error handler for: ${errorContext}`);

        const processedError = processError(error, errorContext);

        // Show toast notification
        if (shouldShowToast) {
          const toastType = processedError.severity === ErrorSeverity.HIGH ? 'error' : 'warning';
          showToast({
            type: toastType,
            message: processedError.userMessage
          });
        }

        // Log error for debugging
        if (shouldLogError) {
          logError(processedError);
        }

        trackFeatureUsage('new-error-handler', true, errorContext);
        return processedError;
      } else {
        // Fallback to old/simple error handling
        debugLog(`Using fallback error handler for: ${errorContext}`);

        if (fallbackToOldHandler) {
          const message = getErrorMessage(error, errorContext);

          if (shouldShowToast) {
            showToast({
              type: 'error',
              message
            });
          }

          if (shouldLogError) {
            console.error(`Error in ${errorContext}:`, error);
          }

          trackFeatureUsage('fallback-error-handler', true, errorContext);
          return { message, error };
        }
      }
    } catch (handlingError) {
      // Ultra-safe fallback
      console.error('Error handler itself failed:', handlingError);
      trackFeatureUsage('error-handler-failed', false, errorContext);

      const fallbackMessage = `${errorContext}: Something went wrong. Please try again.`;

      if (shouldShowToast) {
        showToast({
          type: 'error',
          message: fallbackMessage
        });
      }

      return { message: fallbackMessage, error };
    }
  }, [showToast, shouldShowToast, shouldLogError, context, fallbackToOldHandler]);

  // Specific handlers for common scenarios
  const handleApiError = useCallback((error: any, operation = 'API request') => {
    return handleError(error, operation);
  }, [handleError]);

  const handleFormError = useCallback((error: any, formName = 'Form') => {
    return handleError(error, `${formName} submission`);
  }, [handleError]);

  const handleUploadError = useCallback((error: any, fileName?: string) => {
    const context = fileName ? `Upload ${fileName}` : 'File upload';
    return handleError(error, context);
  }, [handleError]);

  const handleDeleteError = useCallback((error: any, itemName?: string) => {
    const context = itemName ? `Delete ${itemName}` : 'Delete operation';
    return handleError(error, context);
  }, [handleError]);

  // Create safe async wrapper
  const createSafeAsyncHandler = useCallback(<T extends (...args: any[]) => Promise<any>>(
    asyncFn: T,
    operationName?: string
  ): T => {
    return (async (...args: Parameters<T>) => {
      try {
        return await asyncFn(...args);
      } catch (error) {
        handleError(error, operationName);
        throw error; // Re-throw so caller can handle if needed
      }
    }) as T;
  }, [handleError]);

  return {
    handleError,
    handleApiError,
    handleFormError,
    handleUploadError,
    handleDeleteError,
    createSafeAsyncHandler
  };
};

// Wrapper for backward compatibility with existing error handling patterns
export const createLegacyErrorHandler = (showToast: any) => ({
  handleError: (error: any, message?: string) => {
    try {
      const errorMessage = getErrorMessage(error, message);
      showToast({ type: 'error', message: errorMessage });
    } catch (e) {
      console.error('Legacy error handler failed:', e);
      showToast({ type: 'error', message: message || 'An error occurred' });
    }
  }
});

export default useErrorHandler;