// Secure API client with HTTPS enforcement and input sanitization
class SecureApiClient {
  private baseUrl: string;
  private csrfToken: string | null = null;

  constructor() {
    // Enforce HTTPS in production
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? apiUrl.replace('http://', 'https://') 
      : apiUrl;
  }

  /**
   * Sanitize input data before sending to API
   */
  private sanitizeInput(data: any): any {
    if (typeof data === 'string') {
      return data
        .replace(/[<>\"'&]/g, '') // Remove potentially dangerous characters
        .trim()
        .substring(0, 10000); // Limit length
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeInput(item));
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        // Validate key names
        if (this.isValidKey(key)) {
          sanitized[key] = this.sanitizeInput(value);
        }
      }
      return sanitized;
    }
    
    return data;
  }

  private isValidKey(key: string): boolean {
    return !key.startsWith('$') && 
           !key.includes('..') && 
           !key.includes('__proto__') &&
           !key.includes('constructor') &&
           key.length <= 100;
  }

  /**
   * Get CSRF token from server
   */
  private async getCsrfToken(): Promise<string> {
    if (this.csrfToken) {
      return this.csrfToken;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/csrf-token`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        this.csrfToken = data.token;
        return this.csrfToken;
      }
    } catch (error) {
      console.error('Failed to get CSRF token:', error);
    }
    
    return '';
  }

  /**
   * Make secure API request
   */
  async request(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Sanitize request body if present
    if (options.body && typeof options.body === 'string') {
      try {
        const parsedBody = JSON.parse(options.body);
        const sanitizedBody = this.sanitizeInput(parsedBody);
        options.body = JSON.stringify(sanitizedBody);
      } catch (error) {
        // If not JSON, sanitize as string
        options.body = this.sanitizeInput(options.body);
      }
    }

    // Set default headers
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    
    // Add CSRF token for state-changing requests
    const method = options.method?.toUpperCase() || 'GET';
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const csrfToken = await this.getCsrfToken();
      if (csrfToken) {
        headers.set('X-CSRF-Token', csrfToken);
      }
    }

    // Add authentication token if available
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });
  }

  /**
   * GET request
   */
  async get(endpoint: string): Promise<Response> {
    return this.request(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post(endpoint: string, data?: any): Promise<Response> {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put(endpoint: string, data?: any): Promise<Response> {
    return this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch(endpoint: string, data?: any): Promise<Response> {
    return this.request(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint: string): Promise<Response> {
    return this.request(endpoint, { method: 'DELETE' });
  }

  /**
   * Upload file securely
   */
  async uploadFile(endpoint: string, file: File, additionalData?: any): Promise<Response> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      const sanitizedData = this.sanitizeInput(additionalData);
      for (const [key, value] of Object.entries(sanitizedData)) {
        formData.append(key, String(value));
      }
    }

    const headers = new Headers();
    
    // Add CSRF token
    const csrfToken = await this.getCsrfToken();
    if (csrfToken) {
      headers.set('X-CSRF-Token', csrfToken);
    }

    // Add authentication token
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    });
  }
}

// Export singleton instance
export const secureApi = new SecureApiClient();

// Utility function to handle API responses
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP ${response.status}`);
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return response.text() as any;
}