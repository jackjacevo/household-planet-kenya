// Security utilities for frontend
export class SecurityUtils {
  // XSS Protection
  static sanitizeHtml(input: string): string {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  // Input validation
  static validateInput(input: string, type: 'email' | 'phone' | 'text' | 'password'): boolean {
    const patterns = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phone: /^(\+254|0)[17]\d{8}$/,
      text: /^[a-zA-Z0-9\s\-_.,'()]+$/,
      password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    };
    
    return patterns[type].test(input);
  }

  // CSRF Token management
  static async getCsrfToken(): Promise<string> {
    try {
      const response = await fetch('/api/security/csrf-token', {
        credentials: 'include'
      });
      const data = await response.json();
      return data.csrfToken;
    } catch (error) {
      console.error('Failed to get CSRF token:', error);
      return '';
    }
  }

  // Secure storage
  static setSecureItem(key: string, value: string): void {
    try {
      // Use sessionStorage for sensitive data
      sessionStorage.setItem(key, btoa(value));
    } catch (error) {
      console.error('Failed to store secure item:', error);
    }
  }

  static getSecureItem(key: string): string | null {
    try {
      const item = sessionStorage.getItem(key);
      return item ? atob(item) : null;
    } catch (error) {
      console.error('Failed to retrieve secure item:', error);
      return null;
    }
  }

  static removeSecureItem(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove secure item:', error);
    }
  }

  // Content Security Policy violation reporting
  static reportCSPViolation(violation: any): void {
    fetch('/api/security/csp-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(violation),
    }).catch(error => {
      console.error('Failed to report CSP violation:', error);
    });
  }

  // Rate limiting check
  static checkRateLimit(action: string): boolean {
    const key = `rate_limit_${action}`;
    const now = Date.now();
    const stored = localStorage.getItem(key);
    
    if (!stored) {
      localStorage.setItem(key, JSON.stringify({ count: 1, timestamp: now }));
      return true;
    }
    
    const data = JSON.parse(stored);
    const timeDiff = now - data.timestamp;
    
    // Reset after 1 minute
    if (timeDiff > 60000) {
      localStorage.setItem(key, JSON.stringify({ count: 1, timestamp: now }));
      return true;
    }
    
    // Allow max 10 actions per minute
    if (data.count >= 10) {
      return false;
    }
    
    data.count++;
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  }

  // Secure password strength checker
  static checkPasswordStrength(password: string): {
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score++;
    else feedback.push('Use at least 8 characters');

    if (/[a-z]/.test(password)) score++;
    else feedback.push('Include lowercase letters');

    if (/[A-Z]/.test(password)) score++;
    else feedback.push('Include uppercase letters');

    if (/\d/.test(password)) score++;
    else feedback.push('Include numbers');

    if (/[@$!%*?&]/.test(password)) score++;
    else feedback.push('Include special characters');

    return { score, feedback };
  }
}
