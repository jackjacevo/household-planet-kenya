export const ERROR_MESSAGES = {
  // Authentication errors
  AUTH_REQUIRED: 'Authentication required. Please log in.',
  AUTH_INVALID: 'Invalid credentials. Please check your email and password.',
  AUTH_EXPIRED: 'Your session has expired. Please log in again.',
  AUTH_FORBIDDEN: 'Access denied. You do not have permission to perform this action.',
  
  // Network errors
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  
  // Data errors
  DATA_INVALID: 'Invalid data format received from server.',
  DATA_NOT_FOUND: 'Requested data not found.',
  DATA_UNAVAILABLE: 'No data available.',
  
  // Validation errors
  VALIDATION_EMAIL: 'Please enter a valid email address.',
  VALIDATION_PASSWORD: 'Password must be at least 6 characters.',
  VALIDATION_REQUIRED: 'This field is required.',
  
  // Generic errors
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  RETRY_MESSAGE: 'Please try again or contact support if the problem persists.'
};

export function getErrorMessage(error: any): string {
  if (typeof error === 'string') return error;
  
  const message = error?.message || '';
  
  // Authentication errors
  if (message.includes('Authentication required') || message.includes('No authentication token')) {
    return ERROR_MESSAGES.AUTH_REQUIRED;
  }
  if (message.includes('Invalid credentials') || message.includes('Login failed')) {
    return ERROR_MESSAGES.AUTH_INVALID;
  }
  if (message.includes('session has expired') || message.includes('token expired')) {
    return ERROR_MESSAGES.AUTH_EXPIRED;
  }
  if (message.includes('Access denied') || message.includes('Forbidden')) {
    return ERROR_MESSAGES.AUTH_FORBIDDEN;
  }
  
  // Network errors
  if (message.includes('Network error') || message.includes('fetch')) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
  if (message.includes('Server error') || message.includes('HTTP 5')) {
    return ERROR_MESSAGES.SERVER_ERROR;
  }
  
  // Data errors
  if (message.includes('Invalid data format') || message.includes('validation failed')) {
    return ERROR_MESSAGES.DATA_INVALID;
  }
  if (message.includes('not found') || message.includes('404')) {
    return ERROR_MESSAGES.DATA_NOT_FOUND;
  }
  if (message.includes('No data available')) {
    return ERROR_MESSAGES.DATA_UNAVAILABLE;
  }
  
  return message || ERROR_MESSAGES.UNKNOWN_ERROR;
}