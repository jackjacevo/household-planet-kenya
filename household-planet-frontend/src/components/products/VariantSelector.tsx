'use client';

import { useState, useEffect } from 'react';
import { ProductVariant } from '@/types';

interface VariantSelectorProps {
  variants: ProductVariant[];
  onVariantChange: (variant: ProductVariant | null) => void;
}

export function VariantSelector({ variants, onVariantChange }: VariantSelectorProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  
  // Get unique values for each attribute
  const sizes = [...new Set(variants.map(v => v.size).filter(Boolean))];
  const colors = [...new Set(variants.map(v => v.color).filter(Boolean))];
  const materials = [...new Set(variants.map(v => v.material).filter(Boolean))];
  
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');

  useEffect(() => {
    // Find matching variant based on selected attributes
    const matchingVariant = variants.find(variant => 
      (!selectedSize || variant.size === selectedSize) &&
      (!selectedColor || variant.color === selectedColor) &&
      (!selectedMaterial || variant.material === selectedMaterial)
    );
    
    setSelectedVariant(matchingVariant || null);
    onVariantChange(matchingVariant || null);
  }, [selectedSize, selectedColor, selectedMaterial, variants, onVariantChange]);

  if (variants.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Size Selector */}
      {sizes.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">Size</label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size === selectedSize ? '' : size)}
                className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  selectedSize === size
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Selector */}
      {colors.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">Color</label>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color === selectedColor ? '' : color)}
                className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  selectedColor === color
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Material Selector */}
      {materials.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">Material</label>
          <div className="flex flex-wrap gap-2">
            {materials.map((material) => (
              <button
                key={material}
                onClick={() => setSelectedMaterial(material === selectedMaterial ? '' : material)}
                className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  selectedMaterial === material
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {material}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stock Info */}
      {selectedVariant && (
        <div className="text-sm">
          <span className={`font-medium ${
            selectedVariant.stock > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {selectedVariant.stock > 0 
              ? `${selectedVariant.stock} in stock` 
              : 'Out of stock'
            }
          </span>
        </div>
      )}
    </div>
  );
}