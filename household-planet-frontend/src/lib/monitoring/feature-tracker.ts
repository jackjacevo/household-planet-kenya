'use client';

import { debugLog } from '@/lib/config/admin-config';

export const trackFeatureUsage = (feature: string, success: boolean, context?: string) => {
  if (typeof window === 'undefined') return;

  const data = {
    feature,
    success,
    context,
    timestamp: new Date().toISOString(),
  };

  debugLog(`Feature: ${feature}`, data);

  try {
    const existing = JSON.parse(localStorage.getItem('feature-usage') || '[]');
    existing.push(data);
    localStorage.setItem('feature-usage', JSON.stringify(existing.slice(-50)));
  } catch (error) {
    console.warn('Failed to store feature usage', error);
  }
};

export const getFeatureUsageStats = () => {
  try {
    return JSON.parse(localStorage.getItem('feature-usage') || '[]');
  } catch {
    return [];
  }
};