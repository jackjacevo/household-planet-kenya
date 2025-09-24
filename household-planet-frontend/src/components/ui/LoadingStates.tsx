/**
 * Enhanced Loading States Component
 * Provides consistent, accessible loading indicators throughout the app
 * Feature-flagged for safe rollout - maintains backward compatibility
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
  ShoppingCart,
  CreditCard,
  Truck
} from 'lucide-react';
import { adminConfig, isFeatureEnabled, debugLog } from '@/lib/config/admin-config';

// Enhanced loading types
export enum LoadingType {
  SPINNER = 'spinner',
  DOTS = 'dots',
  PULSE = 'pulse',
  SKELETON = 'skeleton',
  PROGRESS = 'progress',
  REFRESH = 'refresh',
  // Legacy compatibility
  DEFAULT = 'default',
  PRODUCTS = 'products',
  CART = 'cart',
  CHECKOUT = 'checkout',
  PAYMENT = 'payment',
  DELIVERY = 'delivery'
}

export enum LoadingSize {
  SMALL = 'sm',
  MEDIUM = 'md',
  LARGE = 'lg',
  EXTRA_LARGE = 'xl'
}

export enum StatusType {
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning'
}

// Legacy interface for backward compatibility
interface LoadingStateProps {
  type?: 'default' | 'products' | 'cart' | 'checkout' | 'payment' | 'delivery';
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

// Enhanced loading props
interface EnhancedLoadingProps {
  type?: LoadingType;
  size?: LoadingSize;
  className?: string;
  color?: string;
  message?: string;
  fallback?: React.ReactNode;
}

// Legacy LoadingState component - maintained for backward compatibility
export function LoadingState({ type = 'default', message, size = 'md' }: LoadingStateProps) {
  // Check if improved loading is enabled
  if (isFeatureEnabled('improvedLoading')) {
    debugLog('Using enhanced loading state for legacy component');

    // Map legacy types to new enhanced types
    const mappedType = (() => {
      switch (type) {
        case 'products':
        case 'cart':
        case 'checkout':
        case 'payment':
        case 'delivery':
          return LoadingType.SPINNER;
        default:
          return LoadingType.SPINNER;
      }
    })();

    return (
      <EnhancedLoading
        type={mappedType}
        size={size === 'sm' ? LoadingSize.SMALL : size === 'lg' ? LoadingSize.LARGE : LoadingSize.MEDIUM}
        message={message}
        contextType={type}
      />
    );
  }
  const getIcon = () => {
    switch (type) {
      case 'products': return Package;
      case 'cart': return ShoppingCart;
      case 'checkout': 
      case 'payment': return CreditCard;
      case 'delivery': return Truck;
      default: return Loader2;
    }
  };

  const getMessage = () => {
    if (message) return message;
    
    switch (type) {
      case 'products': return 'Loading products...';
      case 'cart': return 'Updating cart...';
      case 'checkout': return 'Processing checkout...';
      case 'payment': return 'Processing payment...';
      case 'delivery': return 'Calculating delivery...';
      default: return 'Loading...';
    }
  };

  const getSizes = () => {
    switch (size) {
      case 'sm': return { icon: 'h-4 w-4', text: 'text-sm', container: 'p-4' };
      case 'lg': return { icon: 'h-12 w-12', text: 'text-lg', container: 'p-8' };
      default: return { icon: 'h-8 w-8', text: 'text-base', container: 'p-6' };
    }
  };

  const Icon = getIcon();
  const sizes = getSizes();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex flex-col items-center justify-center ${sizes.container}`}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={`${sizes.icon} text-orange-600 mb-3`}
      >
        <Icon className="w-full h-full" />
      </motion.div>
      <p className={`${sizes.text} text-gray-600 font-medium`}>
        {getMessage()}
      </p>
    </motion.div>
  );
}

interface SkeletonProps {
  type?: 'product-card' | 'product-list' | 'cart-item' | 'order-summary';
  count?: number;
}

export function Skeleton({ type = 'product-card', count = 1 }: SkeletonProps) {
  const renderSkeleton = () => {
    switch (type) {
      case 'product-card':
        return (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="aspect-square bg-gray-200 rounded-xl mb-4 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse" />
            </div>
          </div>
        );
      
      case 'product-list':
        return (
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex space-x-4">
            <div className="w-20 h-20 bg-gray-200 rounded animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
              <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse" />
            </div>
          </div>
        );
      
      case 'cart-item':
        return (
          <div className="flex items-center p-4 border-b">
            <div className="w-16 h-16 bg-gray-200 rounded animate-pulse" />
            <div className="flex-1 ml-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
              <div className="h-8 bg-gray-200 rounded w-24 animate-pulse" />
            </div>
          </div>
        );
      
      case 'order-summary':
        return (
          <div className="bg-white rounded-lg p-6 shadow-sm space-y-4">
            <div className="h-6 bg-gray-200 rounded animate-pulse" />
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
                </div>
              ))}
            </div>
            <div className="h-12 bg-gray-200 rounded animate-pulse" />
          </div>
        );
      
      default:
        return <div className="h-4 bg-gray-200 rounded animate-pulse" />;
    }
  };

  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  type?: 'network' | 'not-found' | 'server' | 'payment' | 'generic';
}

export function ErrorState({ 
  title, 
  message, 
  action, 
  type = 'generic' 
}: ErrorStateProps) {
  const getDefaultContent = () => {
    switch (type) {
      case 'network':
        return {
          title: 'Connection Error',
          message: 'Please check your internet connection and try again.',
        };
      case 'not-found':
        return {
          title: 'Not Found',
          message: 'The item you\'re looking for doesn\'t exist.',
        };
      case 'server':
        return {
          title: 'Server Error',
          message: 'Something went wrong on our end. Please try again later.',
        };
      case 'payment':
        return {
          title: 'Payment Failed',
          message: 'Your payment could not be processed. Please try again.',
        };
      default:
        return {
          title: 'Something went wrong',
          message: 'An unexpected error occurred. Please try again.',
        };
    }
  };

  const defaultContent = getDefaultContent();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-8 text-center"
    >
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-2xl">⚠️</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title || defaultContent.title}
      </h3>
      <p className="text-gray-600 mb-6 max-w-md">
        {message || defaultContent.message}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}

// Enhanced Loading Components for Phase 2

// Spinner loading component
interface SpinnerLoadingProps extends EnhancedLoadingProps {
  type: LoadingType.SPINNER;
  contextType?: string;
}

export function SpinnerLoading({
  size = LoadingSize.MEDIUM,
  className = '',
  color = 'text-blue-600',
  message,
  contextType
}: SpinnerLoadingProps) {
  const sizeClasses = {
    [LoadingSize.SMALL]: 'h-4 w-4',
    [LoadingSize.MEDIUM]: 'h-6 w-6',
    [LoadingSize.LARGE]: 'h-8 w-8',
    [LoadingSize.EXTRA_LARGE]: 'h-12 w-12'
  };

  // Use contextual icons if available
  const getContextualIcon = () => {
    switch (contextType) {
      case 'products': return Package;
      case 'cart': return ShoppingCart;
      case 'checkout':
      case 'payment': return CreditCard;
      case 'delivery': return Truck;
      default: return Loader2;
    }
  };

  const Icon = getContextualIcon();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`flex items-center justify-center gap-2 ${className}`}
    >
      <Icon className={`animate-spin ${sizeClasses[size]} ${color}`} />
      {message && (
        <span className="text-sm text-gray-600 animate-pulse">{message}</span>
      )}
    </motion.div>
  );
}

// Dots loading component
interface DotsLoadingProps extends EnhancedLoadingProps {
  type: LoadingType.DOTS;
}

export function DotsLoading({ size = LoadingSize.MEDIUM, className = '', color = 'bg-blue-600', message }: DotsLoadingProps) {
  const sizeClasses = {
    [LoadingSize.SMALL]: 'h-1.5 w-1.5',
    [LoadingSize.MEDIUM]: 'h-2 w-2',
    [LoadingSize.LARGE]: 'h-3 w-3',
    [LoadingSize.EXTRA_LARGE]: 'h-4 w-4'
  };

  const gapClasses = {
    [LoadingSize.SMALL]: 'gap-1',
    [LoadingSize.MEDIUM]: 'gap-1.5',
    [LoadingSize.LARGE]: 'gap-2',
    [LoadingSize.EXTRA_LARGE]: 'gap-2.5'
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`flex flex-col items-center gap-2 ${className}`}
    >
      <div className={`flex items-center ${gapClasses[size]}`}>
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className={`rounded-full ${sizeClasses[size]} ${color}`}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: index * 0.2
            }}
          />
        ))}
      </div>
      {message && (
        <span className="text-sm text-gray-600">{message}</span>
      )}
    </motion.div>
  );
}

// Progress loading component
interface ProgressLoadingProps extends EnhancedLoadingProps {
  type: LoadingType.PROGRESS;
  progress?: number;
  showPercentage?: boolean;
}

export function ProgressLoading({
  progress = 0,
  showPercentage = true,
  className = '',
  color = 'bg-blue-600',
  message
}: ProgressLoadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`w-full ${className}`}
    >
      <div className="flex justify-between items-center mb-1">
        {message && <span className="text-sm text-gray-600">{message}</span>}
        {showPercentage && (
          <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          className={`h-2 rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}

// Status loading component
interface StatusLoadingProps {
  status: StatusType;
  message?: string;
  size?: LoadingSize;
  className?: string;
}

export function StatusLoading({
  status,
  message,
  size = LoadingSize.MEDIUM,
  className = ''
}: StatusLoadingProps) {
  const sizeClasses = {
    [LoadingSize.SMALL]: 'h-4 w-4',
    [LoadingSize.MEDIUM]: 'h-6 w-6',
    [LoadingSize.LARGE]: 'h-8 w-8',
    [LoadingSize.EXTRA_LARGE]: 'h-12 w-12'
  };

  const statusConfig = {
    [StatusType.LOADING]: {
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      defaultMessage: 'Processing...'
    },
    [StatusType.SUCCESS]: {
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      defaultMessage: 'Success!'
    },
    [StatusType.ERROR]: {
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      defaultMessage: 'Error occurred'
    },
    [StatusType.WARNING]: {
      icon: AlertCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      defaultMessage: 'Warning'
    }
  };

  const config = statusConfig[status];
  const IconComponent = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`flex items-center gap-2 p-3 rounded-lg border ${config.bgColor} ${config.borderColor} ${className}`}
    >
      <IconComponent className={`${sizeClasses[size]} ${config.color} ${status === StatusType.LOADING ? 'animate-pulse' : ''}`} />
      <span className={`text-sm ${config.color}`}>
        {message || config.defaultMessage}
      </span>
    </motion.div>
  );
}

// Main enhanced loading component
interface EnhancedLoadingPropsWithContext extends EnhancedLoadingProps {
  contextType?: string;
}

export function EnhancedLoading({
  type = LoadingType.SPINNER,
  size = LoadingSize.MEDIUM,
  className = '',
  color,
  message,
  fallback,
  contextType,
  ...props
}: EnhancedLoadingPropsWithContext) {
  // Check if enhanced loading is enabled
  if (!isFeatureEnabled('improvedLoading')) {
    debugLog('Using fallback loading state');

    if (fallback) {
      return <>{fallback}</>;
    }

    // Simple fallback loading using existing component structure
    return (
      <div className={`flex items-center justify-center gap-2 ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        {message && <span className="text-sm text-gray-600">{message}</span>}
      </div>
    );
  }

  debugLog('Using enhanced loading states');

  const commonProps = { size, className, color, message };

  return (
    <AnimatePresence>
      {type === LoadingType.SPINNER && <SpinnerLoading {...commonProps} type={LoadingType.SPINNER} contextType={contextType} />}
      {type === LoadingType.DOTS && <DotsLoading {...commonProps} type={LoadingType.DOTS} />}
      {type === LoadingType.PROGRESS && <ProgressLoading {...commonProps} type={LoadingType.PROGRESS} {...(props as any)} />}
    </AnimatePresence>
  );
}

// Hook for easier loading state management
export function useLoadingStates() {
  return {
    LoadingState, // Legacy component
    EnhancedLoading,
    SpinnerLoading,
    DotsLoading,
    ProgressLoading,
    StatusLoading,
    Skeleton, // Existing skeleton component
    ErrorState, // Existing error component
    LoadingType,
    LoadingSize,
    StatusType,

    // Helper functions
    createLoadingComponent: (type: LoadingType, defaultProps: Partial<EnhancedLoadingProps> = {}) =>
      (props: EnhancedLoadingProps) => <EnhancedLoading {...defaultProps} {...props} type={type} />,

    isLoadingEnabled: () => isFeatureEnabled('improvedLoading')
  };
}
