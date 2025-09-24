/**
 * Utility to sanitize console logs and prevent base64 data exposure
 */
export class LogSanitizer {
  /**
   * Check if a string contains base64 image data
   */
  private static isBase64ImageData(str: string): boolean {
    if (typeof str !== 'string' || str.length < 100) return false;
    
    // Check for data URL format
    if (str.startsWith('data:image/')) return true;
    
    // Check for long base64 strings
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    return str.length > 500 && base64Regex.test(str);
  }
  
  /**
   * Sanitize data before logging
   */
  static sanitize(data: any): any {
    if (!data) return data;
    
    if (typeof data === 'string') {
      if (this.isBase64ImageData(data)) {
        return `[BASE64_IMAGE_DATA:${data.length}_chars]`;
      }
      return data;
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitize(item));
    }
    
    if (typeof data === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string' && this.isBase64ImageData(value)) {
          sanitized[key] = `[BASE64_IMAGE_DATA:${value.length}_chars]`;
        } else if (key.toLowerCase().includes('buffer') || key.toLowerCase().includes('data')) {
          sanitized[key] = '[BINARY_DATA]';
        } else {
          sanitized[key] = this.sanitize(value);
        }
      }
      return sanitized;
    }
    
    return data;
  }
  
  /**
   * Safe console.log wrapper
   */
  static log(message: string, ...args: any[]): void {
    const sanitizedArgs = args.map(arg => this.sanitize(arg));
    console.log(message, ...sanitizedArgs);
  }
  
  /**
   * Safe console.error wrapper
   */
  static error(message: string, ...args: any[]): void {
    const sanitizedArgs = args.map(arg => this.sanitize(arg));
    console.error(message, ...sanitizedArgs);
  }
}

// Override global console methods in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalLog = console.log;
  const originalError = console.error;
  
  console.log = (message: any, ...args: any[]) => {
    if (typeof message === 'string' && args.length > 0) {
      LogSanitizer.log(message, ...args);
    } else {
      originalLog(LogSanitizer.sanitize(message), ...args.map(arg => LogSanitizer.sanitize(arg)));
    }
  };
  
  console.error = (message: any, ...args: any[]) => {
    if (typeof message === 'string' && args.length > 0) {
      LogSanitizer.error(message, ...args);
    } else {
      originalError(LogSanitizer.sanitize(message), ...args.map(arg => LogSanitizer.sanitize(arg)));
    }
  };
}