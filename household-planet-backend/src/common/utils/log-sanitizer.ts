export class LogSanitizer {
  /**
   * Sanitizes data before logging to prevent sensitive information exposure
   */
  static sanitizeForLog(data: any): any {
    if (!data) return data;
    
    if (typeof data === 'string') {
      // Check if it's base64 data
      if (this.isBase64(data)) {
        return `[BASE64_DATA:${data.length}_chars]`;
      }
      return data;
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeForLog(item));
    }
    
    if (typeof data === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        if (key.toLowerCase().includes('buffer') || key.toLowerCase().includes('data')) {
          sanitized[key] = `[BUFFER:${Buffer.isBuffer(value) ? value.length : 'unknown'}_bytes]`;
        } else {
          sanitized[key] = this.sanitizeForLog(value);
        }
      }
      return sanitized;
    }
    
    return data;
  }
  
  /**
   * Check if string is base64 encoded
   */
  private static isBase64(str: string): boolean {
    if (str.length < 100) return false; // Short strings unlikely to be base64 images
    
    try {
      // Check for data URL format
      if (str.startsWith('data:image/')) return true;
      
      // Check for base64 pattern (long strings with base64 chars)
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      return str.length > 100 && base64Regex.test(str);
    } catch {
      return false;
    }
  }
  
  /**
   * Safe console.log that sanitizes data
   */
  static log(message: string, data?: any): void {
    if (data) {
      console.log(message, this.sanitizeForLog(data));
    } else {
      console.log(message);
    }
  }
}