'use client';

import React, { useEffect, useState } from 'react';
import { useABTest } from './ABTestProvider';

interface ABTestLayoutProps {
  children: React.ReactNode;
  experimentType: string;
  variants: {
    [key: string]: React.ComponentType<any>;
  };
  fallback?: React.ComponentType<any>;
  props?: any;
}

export const ABTestLayout: React.FC<ABTestLayoutProps> = ({
  children,
  experimentType,
  variants,
  fallback,
  props = {},
}) => {
  const { getExperimentConfig, trackConversion } = useABTest();
  const [variantComponent, setVariantComponent] = useState<React.ComponentType<any> | null>(null);
  const [experimentId, setExperimentId] = useState<string | null>(null);

  useEffect(() => {
    const loadVariant = async () => {
      const config = await getExperimentConfig(experimentType);
      
      if (config && variants[config.variantName]) {
        setVariantComponent(() => variants[config.variantName]);
        setExperimentId(config.experimentId);
        
        // Track page view for this variant
        trackConversion(config.experimentId, 'page_view');
      } else if (fallback) {
        setVariantComponent(() => fallback);
      }
    };

    loadVariant();
  }, [experimentType, variants, fallback, getExperimentConfig, trackConversion]);

  if (!variantComponent) {
    return <>{children}</>;
  }

  const VariantComponent = variantComponent;
  return <VariantComponent {...props}>{children}</VariantComponent>;
};

// Predefined layout variants
export const ProductPageLayouts = {
  traditional: ({ children }: { children: React.ReactNode }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="order-1">
        {/* Image gallery */}
        {children}
      </div>
      <div className="order-2">
        {/* Product info */}
      </div>
    </div>
  ),
  
  modern: ({ children }: { children: React.ReactNode }) => (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-2xl mb-8">
        {/* Centered image */}
        {children}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
        <div className="lg:col-span-2">
          {/* Product info */}
        </div>
        <div>
          {/* Reviews sidebar */}
        </div>
      </div>
    </div>
  ),
};

export const CheckoutLayouts = {
  single_page: ({ children }: { children: React.ReactNode }) => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {children}
      </div>
    </div>
  ),
  
  multi_step: ({ children }: { children: React.ReactNode }) => (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        {/* Progress indicator */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">1</div>
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">2</div>
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">3</div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-8">
        {children}
      </div>
    </div>
  ),
};