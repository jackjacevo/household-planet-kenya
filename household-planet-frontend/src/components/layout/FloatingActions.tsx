'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, ShoppingCart, Phone, Plus, X } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

export function FloatingActions() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { getTotalItems } = useCart();
  
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsExpanded(false);
      }
    };
    
    if (isExpanded) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isExpanded]);

  const actions = [
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      href: 'https://wa.me/254790227760',
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      icon: Phone,
      label: 'Call Us',
      href: 'tel:+254790227760',
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      icon: ShoppingCart,
      label: 'Cart',
      href: '/cart',
      color: 'bg-orange-600 hover:bg-orange-700',
      badge: getTotalItems(),
    },
  ];

  return (
    <div className="fixed bottom-20 right-4 z-50 md:hidden">
      {/* Action Buttons */}
      <div className={`flex flex-col space-y-3 mb-3 transition-all duration-300 ${
        isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}>
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <a
              key={action.label}
              href={action.href}
              className={`${action.color} text-white p-3 rounded-full shadow-lg transition-all duration-300 relative group touch-feedback min-h-touch min-w-touch flex items-center justify-center`}
              style={{ transitionDelay: `${index * 50}ms` }}
              aria-label={action.label}
            >
              <Icon className="h-5 w-5" />
              {action.badge && action.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {action.badge > 99 ? '99+' : action.badge}
                </span>
              )}
              {/* Tooltip for desktop */}
              <span className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {action.label}
              </span>
            </a>
          );
        })}
      </div>

      {/* Main Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`bg-green-600 hover:bg-green-700 active:bg-green-800 text-white p-4 rounded-full shadow-lg transition-all duration-300 touch-feedback min-h-touch min-w-touch flex items-center justify-center ${
          isExpanded ? 'rotate-45 scale-110' : 'rotate-0 scale-100'
        }`}
        aria-label={isExpanded ? 'Close quick actions' : 'Open quick actions'}
        aria-expanded={isExpanded}
      >
        {isExpanded ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </button>
      
      {/* Background overlay when expanded */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 -z-10"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
}
