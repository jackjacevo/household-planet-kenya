'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X, ShoppingCart, Heart } from 'lucide-react';

export interface ToastProps {
  id: string;
  variant: 'success' | 'destructive' | 'info' | 'cart' | 'wishlist';
  title: string;
  description?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const ToastItem = ({ id, variant, title, description, duration = 4000, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const icons = {
    success: CheckCircle,
    destructive: AlertCircle,
    info: Info,
    cart: ShoppingCart,
    wishlist: Heart,
  };

  const colors = {
    success: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800',
    destructive: 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-800',
    info: 'bg-gradient-to-r from-blue-50 to-sky-50 border-blue-200 text-blue-800',
    cart: 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 text-orange-800',
    wishlist: 'bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200 text-pink-800',
  };

  const iconColors = {
    success: 'text-green-500',
    destructive: 'text-red-500',
    info: 'text-blue-500',
    cart: 'text-orange-500',
    wishlist: 'text-pink-500',
  };

  const Icon = icons[variant];

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        x: 0, 
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 30
        }
      }}
      exit={{ 
        opacity: 0, 
        x: 300, 
        scale: 0.8,
        transition: {
          duration: 0.2
        }
      }}
      whileHover={{ scale: 1.02 }}
      className={`max-w-sm w-full ${colors[variant]} border rounded-xl shadow-xl backdrop-blur-sm p-4 cursor-pointer`}
      onClick={() => onClose(id)}
    >
      <div className="flex items-start">
        <div className={`p-2 rounded-full bg-white/50 ${iconColors[variant]} flex-shrink-0`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-semibold">{title}</p>
          {description && <p className="text-xs mt-1 opacity-80">{description}</p>}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose(id);
          }}
          className="ml-2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-white/30"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
};

export const Toast = ToastItem;

export function ToastContainer({ toasts }: { toasts: ToastProps[] }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} {...toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}