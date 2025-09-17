'use client';

import { motion } from 'framer-motion';
import { Loader2, Package, ShoppingCart, CreditCard, Truck } from 'lucide-react';

interface LoadingStateProps {
  type?: 'default' | 'products' | 'cart' | 'checkout' | 'payment' | 'delivery';
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingState({ type = 'default', message, size = 'md' }: LoadingStateProps) {
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
