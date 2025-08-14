'use client';

import { ReactNode } from 'react';
import DOMPurify from 'isomorphic-dompurify';

interface XSSProtectionProps {
  children?: ReactNode;
  html?: string;
  allowedTags?: string[];
  allowedAttributes?: string[];
  className?: string;
}

/**
 * Component that sanitizes HTML content to prevent XSS attacks
 */
export function XSSProtection({ 
  children, 
  html, 
  allowedTags = ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
  allowedAttributes = [],
  className 
}: XSSProtectionProps) {
  
  if (html) {
    const sanitizedHtml = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: allowedAttributes,
      KEEP_CONTENT: true,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      RETURN_DOM_IMPORT: false,
    });

    return (
      <div 
        className={className}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    );
  }

  return <div className={className}>{children}</div>;
}

/**
 * Sanitize text content to prevent XSS
 */
export function sanitizeText(text: string): string {
  if (typeof text !== 'string') {
    return '';
  }
  
  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
}

/**
 * Sanitize and limit text length
 */
export function sanitizeAndLimitText(text: string, maxLength: number = 1000): string {
  const sanitized = sanitizeText(text);
  return sanitized.length > maxLength 
    ? sanitized.substring(0, maxLength) + '...' 
    : sanitized;
}

/**
 * Validate and sanitize user input
 */
export function validateUserInput(input: any): any {
  if (typeof input === 'string') {
    return sanitizeText(input).trim();
  }
  
  if (Array.isArray(input)) {
    return input.map(item => validateUserInput(item));
  }
  
  if (typeof input === 'object' && input !== null) {
    const validated: any = {};
    for (const [key, value] of Object.entries(input)) {
      // Validate key names
      if (isValidKey(key)) {
        validated[key] = validateUserInput(value);
      }
    }
    return validated;
  }
  
  return input;
}

function isValidKey(key: string): boolean {
  return !key.startsWith('$') && 
         !key.includes('..') && 
         !key.includes('__proto__') &&
         !key.includes('constructor') &&
         key.length <= 100 &&
         /^[a-zA-Z0-9_-]+$/.test(key);
}