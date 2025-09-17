'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { SecurityUtils } from '@/lib/security';

interface SecurityContextType {
  csrfToken: string;
  isSecure: boolean;
  reportViolation: (violation: any) => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export function SecurityProvider({ children }: { children: ReactNode }) {
  const [csrfToken, setCsrfToken] = useState('');
  const [isSecure, setIsSecure] = useState(false);

  useEffect(() => {
    // Initialize security
    const initSecurity = async () => {
      try {
        // Get CSRF token
        const token = await SecurityUtils.getCsrfToken();
        setCsrfToken(token);

        // Check if connection is secure
        setIsSecure(window.location.protocol === 'https:' || window.location.hostname === 'localhost');

        // Set up CSP violation reporting
        document.addEventListener('securitypolicyviolation', (e) => {
          SecurityUtils.reportCSPViolation({
            blockedURI: e.blockedURI,
            violatedDirective: e.violatedDirective,
            originalPolicy: e.originalPolicy,
            documentURI: e.documentURI,
            lineNumber: e.lineNumber,
            columnNumber: e.columnNumber,
            sourceFile: e.sourceFile,
          });
        });

        // Warn about insecure connections in production
        if (process.env.NODE_ENV === 'production' && !isSecure) {
          console.warn('Insecure connection detected. Please use HTTPS.');
        }

      } catch (error) {
        console.error('Security initialization failed:', error);
      }
    };

    initSecurity();
  }, []);

  const reportViolation = (violation: any) => {
    SecurityUtils.reportCSPViolation(violation);
  };

  return (
    <SecurityContext.Provider value={{ csrfToken, isSecure, reportViolation }}>
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
}
