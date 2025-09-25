/**
 * Admin Configuration and Feature Flags
 * This file manages feature flags and configuration for admin panel
 * All features start as FALSE for production safety
 */

interface AdminFeatures {
  newConfirmDialogs: boolean;
  improvedValidation: boolean;
  improvedLoading: boolean;
  improvedLayout: boolean;
  unifiedDashboard: boolean;
  advancedCaching: boolean;
  apiServiceLayer: boolean;
}

interface AdminConfig {
  apiUrl: string;
  features: AdminFeatures;
  debug: boolean;
}

// Get feature flag value with fallback
const getFeatureFlag = (key: string, defaultValue: boolean = false): boolean => {
  if (typeof window === 'undefined') return defaultValue;

  try {
    const envValue = process.env[`NEXT_PUBLIC_FEATURE_${key.toUpperCase()}`];
    return envValue === 'true';
  } catch (error) {
    console.warn(`Failed to read feature flag: ${key}, using default: ${defaultValue}`);
    return defaultValue;
  }
};

// Admin configuration with safe defaults
export const adminConfig: AdminConfig = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.householdplanetkenya.co.ke/api',
  debug: process.env.NODE_ENV === 'development',
  features: {
    // Phase 1 features (enabled for production)
    apiServiceLayer: getFeatureFlag('API_SERVICE_LAYER', true),
    improvedValidation: getFeatureFlag('IMPROVED_VALIDATION', true),
    improvedLoading: getFeatureFlag('IMPROVED_LOADING', true),

    // Phase 2 features (will be added later)
    newConfirmDialogs: getFeatureFlag('NEW_CONFIRM_DIALOGS', false),
    improvedLayout: getFeatureFlag('IMPROVED_LAYOUT', false),

    // Phase 3 features (Performance & Polish)
    unifiedDashboard: getFeatureFlag('UNIFIED_DASHBOARD', false),
    advancedCaching: getFeatureFlag('ADVANCED_CACHING', false),
  }
};

// Feature flag checker utility
export const isFeatureEnabled = (feature: keyof AdminFeatures): boolean => {
  try {
    return adminConfig.features[feature];
  } catch (error) {
    console.warn(`Feature check failed for: ${feature}`);
    return false;
  }
};

// Debug logger for development
export const debugLog = (message: string, data?: any) => {
  if (adminConfig.debug) {
    console.log(`[Admin Debug] ${message}`, data || '');
  }
};

// Feature usage tracker
export const trackFeatureUsage = (feature: string, success: boolean, context?: string) => {
  if (adminConfig.debug) {
    console.log(`[Feature Usage] ${feature}: ${success ? 'SUCCESS' : 'FAILED'}`, context || '');
  }

  // In production, you could send this to analytics
  // analytics.track('admin_feature_usage', { feature, success, context });
};

export default adminConfig;