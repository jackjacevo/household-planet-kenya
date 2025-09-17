'use client';

import { motion } from 'framer-motion';

interface CompanyTaglineProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
}

export function CompanyTagline({ 
  className = '', 
  size = 'md', 
  animated = false 
}: CompanyTaglineProps) {
  const sizeClasses = {
    sm: 'text-sm font-medium',
    md: 'text-lg font-semibold',
    lg: 'text-2xl font-bold',
    xl: 'text-4xl font-bold'
  };

  const content = (
    <span className={`${sizeClasses[size]} text-orange-600 ${className}`}>
      Transforming Your Home
    </span>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}
