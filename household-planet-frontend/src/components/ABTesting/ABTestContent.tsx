'use client';

import React, { useEffect, useState } from 'react';
import { useABTest } from './ABTestProvider';

interface ABTestContentProps {
  experimentType: string;
  fallbackContent: React.ReactNode;
  className?: string;
}

export const ABTestContent: React.FC<ABTestContentProps> = ({
  experimentType,
  fallbackContent,
  className = '',
}) => {
  const { getExperimentConfig, trackConversion } = useABTest();
  const [content, setContent] = useState<React.ReactNode>(fallbackContent);
  const [experimentId, setExperimentId] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      const config = await getExperimentConfig(experimentType);
      
      if (config) {
        setExperimentId(config.experimentId);
        
        // Track content view
        trackConversion(config.experimentId, 'content_view');
        
        // Render content based on variant
        const variantContent = renderVariantContent(config.variantName, config.config);
        if (variantContent) {
          setContent(variantContent);
        }
      }
    };

    loadContent();
  }, [experimentType, getExperimentConfig, trackConversion]);

  const renderVariantContent = (variantName: string, config: any) => {
    switch (experimentType) {
      case 'CONTENT':
        return (
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">{config.headline}</h1>
            <p className="text-xl text-gray-600 mb-8">{config.subheadline}</p>
            <button 
              className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
              onClick={() => experimentId && trackConversion(experimentId, 'cta_click')}
            >
              {config.cta}
            </button>
          </div>
        );
      
      case 'PRICING':
        return (
          <div className={`pricing-display variant-${variantName}`}>
            {config.showDiscount && (
              <div className="discount-badge bg-red-500 text-white px-2 py-1 rounded text-sm">
                Save 30%
              </div>
            )}
            <div className={`price ${config.emphasizePrice ? 'emphasized' : ''}`}>
              <span className="currency">KSh</span>
              <span className="amount">5,500</span>
              {config.showDiscount && (
                <span className="original-price line-through text-gray-500 ml-2">
                  KSh 7,850
                </span>
              )}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return <div className={className}>{content}</div>;
};

// Predefined content variants
export const HeroContentVariants = {
  benefit_focused: {
    headline: 'Quality Household Items Delivered Fast',
    subheadline: 'Free delivery across Kenya. 30-day returns.',
    cta: 'Shop Now',
  },
  product_focused: {
    headline: 'Premium Kitchen & Home Essentials',
    subheadline: 'Discover our curated collection of household items.',
    cta: 'Browse Products',
  },
  urgency_focused: {
    headline: 'Limited Time: 30% Off Everything',
    subheadline: 'Hurry! Sale ends soon. Free delivery included.',
    cta: 'Shop Sale',
  },
};

export const PricingDisplayVariants = {
  standard: {
    showDiscount: false,
    emphasizePrice: false,
  },
  discount_emphasis: {
    showDiscount: true,
    emphasizePrice: false,
  },
  price_emphasis: {
    showDiscount: true,
    emphasizePrice: true,
  },
};