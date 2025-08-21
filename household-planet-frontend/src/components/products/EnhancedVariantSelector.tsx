'use client';

import { useState, useEffect } from 'react';
import { CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface Variant {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  size?: string;
  color?: string;
  material?: string;
  weight?: number;
  dimensions?: string;
  images?: string[];
  isActive: boolean;
  attributes?: Record<string, any>;
}

interface VariantSelectorProps {
  variants: Variant[];
  selectedVariant?: Variant;
  onVariantChange: (variant: Variant | null) => void;
  showPriceRange?: boolean;
  showStock?: boolean;
}

export default function EnhancedVariantSelector({ 
  variants, 
  selectedVariant, 
  onVariantChange,
  showPriceRange = true,
  showStock = true
}: VariantSelectorProps) {
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [availableVariants, setAvailableVariants] = useState<Variant[]>([]);

  // Filter active variants
  const activeVariants = variants.filter(v => v.isActive);

  useEffect(() => {
    setAvailableVariants(activeVariants);
  }, [variants]);

  // Get unique attribute values with availability
  const getUniqueAttributes = () => {
    const attributes: Record<string, Set<string>> = {};
    
    availableVariants.forEach(variant => {
      // Standard attributes
      if (variant.size) {
        if (!attributes.size) attributes.size = new Set();
        attributes.size.add(variant.size);
      }
      if (variant.color) {
        if (!attributes.color) attributes.color = new Set();
        attributes.color.add(variant.color);
      }
      if (variant.material) {
        if (!attributes.material) attributes.material = new Set();
        attributes.material.add(variant.material);
      }
      
      // Custom attributes
      if (variant.attributes) {
        Object.entries(variant.attributes).forEach(([key, value]) => {
          if (value && typeof value === 'string') {
            if (!attributes[key]) attributes[key] = new Set();
            attributes[key].add(value);
          }
        });
      }
    });

    return Object.fromEntries(
      Object.entries(attributes).map(([key, values]) => [key, Array.from(values)])
    );
  };

  const uniqueAttributes = getUniqueAttributes();

  const handleAttributeChange = (attributeName: string, value: string) => {
    const newAttributes = { ...selectedAttributes, [attributeName]: value };
    setSelectedAttributes(newAttributes);

    // Find matching variant
    const matchingVariant = availableVariants.find(variant => {
      return Object.entries(newAttributes).every(([key, val]) => {
        if (key === 'size') return variant.size === val;
        if (key === 'color') return variant.color === val;
        if (key === 'material') return variant.material === val;
        return variant.attributes?.[key] === val;
      });
    });

    onVariantChange(matchingVariant || null);
  };

  const isAttributeAvailable = (attributeName: string, value: string) => {
    const testAttributes = { ...selectedAttributes, [attributeName]: value };
    
    return availableVariants.some(variant => {
      if (variant.stock === 0) return false;
      
      return Object.entries(testAttributes).every(([key, val]) => {
        if (key === 'size') return variant.size === val;
        if (key === 'color') return variant.color === val;
        if (key === 'material') return variant.material === val;
        return variant.attributes?.[key] === val;
      });
    });
  };

  const getVariantForAttribute = (attributeName: string, value: string) => {
    const testAttributes = { ...selectedAttributes, [attributeName]: value };
    
    return availableVariants.find(variant => {
      return Object.entries(testAttributes).every(([key, val]) => {
        if (key === 'size') return variant.size === val;
        if (key === 'color') return variant.color === val;
        if (key === 'material') return variant.material === val;
        return variant.attributes?.[key] === val;
      });
    });
  };

  const getPriceRange = () => {
    if (availableVariants.length === 0) return null;
    
    const prices = availableVariants.map(v => v.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    
    return { min, max };
  };

  const priceRange = getPriceRange();

  if (activeVariants.length <= 1) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Price Range Display */}
      {showPriceRange && priceRange && priceRange.min !== priceRange.max && (
        <div className="text-sm text-gray-600">
          Price range: KSh {priceRange.min.toLocaleString()} - KSh {priceRange.max.toLocaleString()}
        </div>
      )}

      {/* Attribute Selectors */}
      {Object.entries(uniqueAttributes).map(([attributeName, values]) => (
        <div key={attributeName}>
          <h4 className="text-sm font-medium text-gray-900 mb-3 capitalize">
            {attributeName.replace(/([A-Z])/g, ' $1').trim()}
          </h4>
          
          {attributeName === 'color' ? (
            <div className="flex flex-wrap gap-3">
              {values.map((value) => {
                const isSelected = selectedAttributes[attributeName] === value;
                const isAvailable = isAttributeAvailable(attributeName, value);
                const variant = getVariantForAttribute(attributeName, value);
                const isLowStock = variant && variant.stock <= variant.lowStockThreshold;
                
                return (
                  <div key={value} className="relative">
                    <button
                      onClick={() => handleAttributeChange(attributeName, value)}
                      disabled={!isAvailable}
                      className={`
                        w-10 h-10 rounded-full border-2 relative transition-all
                        ${isSelected ? 'border-gray-900 ring-2 ring-gray-300' : 'border-gray-300'}
                        ${!isAvailable ? 'opacity-30 cursor-not-allowed' : 'hover:border-gray-500'}
                        ${isLowStock ? 'ring-1 ring-orange-400' : ''}
                      `}
                      style={{ backgroundColor: value.toLowerCase() }}
                      title={`${value}${isLowStock ? ' (Low Stock)' : ''}${!isAvailable ? ' (Out of Stock)' : ''}`}
                    >
                      {isSelected && (
                        <CheckIcon className="w-5 h-5 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 drop-shadow" />
                      )}
                      {!isAvailable && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-8 h-0.5 bg-red-500 rotate-45"></div>
                        </div>
                      )}
                    </button>
                    {isLowStock && isAvailable && (
                      <ExclamationTriangleIcon className="w-3 h-3 text-orange-500 absolute -top-1 -right-1" />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {values.map((value) => {
                const isSelected = selectedAttributes[attributeName] === value;
                const isAvailable = isAttributeAvailable(attributeName, value);
                const variant = getVariantForAttribute(attributeName, value);
                const isLowStock = variant && variant.stock <= variant.lowStockThreshold;
                
                return (
                  <div key={value} className="relative">
                    <button
                      onClick={() => handleAttributeChange(attributeName, value)}
                      disabled={!isAvailable}
                      className={`
                        px-4 py-2 text-sm border rounded-lg transition-all relative
                        ${isSelected 
                          ? 'border-gray-900 bg-gray-900 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'
                        }
                        ${!isAvailable 
                          ? 'opacity-50 cursor-not-allowed line-through' 
                          : 'hover:border-gray-500'
                        }
                        ${isLowStock && isAvailable ? 'border-orange-400' : ''}
                      `}
                    >
                      {value}
                      {isLowStock && isAvailable && (
                        <ExclamationTriangleIcon className="w-3 h-3 text-orange-500 absolute -top-1 -right-1" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {/* Selected Variant Info */}
      {selectedVariant && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Selected Variant:</span>
              <span className="font-medium">{selectedVariant.name}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">SKU:</span>
              <span className="text-sm font-mono">{selectedVariant.sku}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Price:</span>
              <span className="font-semibold text-green-600">
                KSh {selectedVariant.price.toLocaleString()}
              </span>
            </div>
            
            {showStock && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Availability:</span>
                <div className="flex items-center space-x-2">
                  {selectedVariant.stock > 0 ? (
                    <>
                      <span className={`text-sm ${
                        selectedVariant.stock <= selectedVariant.lowStockThreshold 
                          ? 'text-orange-600' 
                          : 'text-green-600'
                      }`}>
                        {selectedVariant.stock} in stock
                      </span>
                      {selectedVariant.stock <= selectedVariant.lowStockThreshold && (
                        <span className="text-xs text-orange-600 font-medium">
                          (Low Stock)
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-sm text-red-600 font-medium">
                      Out of stock
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {selectedVariant.weight && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Weight:</span>
                <span className="text-sm">{selectedVariant.weight}kg</span>
              </div>
            )}
            
            {selectedVariant.dimensions && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Dimensions:</span>
                <span className="text-sm">{selectedVariant.dimensions}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}