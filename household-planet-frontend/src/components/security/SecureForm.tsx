'use client';

import { FormEvent, ReactNode } from 'react';
import { useSecurity } from './SecurityProvider';
import { SecurityUtils } from '@/lib/security';

interface SecureFormProps {
  children: ReactNode;
  onSubmit: (formData: FormData, csrfToken: string) => void;
  action?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  className?: string;
  rateLimitAction?: string;
}

export function SecureForm({ 
  children, 
  onSubmit, 
  action,
  method = 'POST',
  className,
  rateLimitAction 
}: SecureFormProps) {
  const { csrfToken } = useSecurity();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Rate limiting check
    if (rateLimitAction && !SecurityUtils.checkRateLimit(rateLimitAction)) {
      alert('Too many requests. Please wait before trying again.');
      return;
    }

    const formData = new FormData(e.currentTarget);
    
    // Add CSRF token
    if (csrfToken) {
      formData.append('_csrf', csrfToken);
    }

    // Validate all form inputs
    const inputs = e.currentTarget.querySelectorAll('input, textarea, select');
    let isValid = true;

    inputs.forEach((input) => {
      const element = input as HTMLInputElement;
      const value = element.value;
      
      // Basic XSS protection
      if (value && value !== SecurityUtils.sanitizeHtml(value)) {
        isValid = false;
        element.setCustomValidity('Invalid characters detected');
      } else {
        element.setCustomValidity('');
      }
    });

    if (!isValid) {
      alert('Please check your input for invalid characters.');
      return;
    }

    onSubmit(formData, csrfToken);
  };

  return (
    <form 
      onSubmit={handleSubmit}
      action={action}
      method={method}
      className={className}
      noValidate
    >
      {children}
      {csrfToken && (
        <input type="hidden" name="_csrf" value={csrfToken} />
      )}
    </form>
  );
}
