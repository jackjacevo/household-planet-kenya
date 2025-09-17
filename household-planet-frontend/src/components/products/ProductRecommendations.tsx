'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from './ProductCard';
import { Product } from '@/types';
import { api } from '@/lib/api';
import { Loader2, Sparkles } from 'lucide-react';

interface ProductRecommendationsProps {
  productId: string;
  title?: string;
  type?: 'RELATED' | 'FREQUENTLY_BOUGHT_TOGETHER' | 'SIMILAR' | 'TRENDING';
  limit?: number;
}

export function ProductRecommendations({ 
  productId, 
  title = 'You might also like',
  type = 'RELATED',
  limit = 6 
}: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        console.log('Fetching recommendations for product:', productId, 'type:', type);
        const response = await api.getProductRecommendations(productId, type, limit);
        console.log('Recommendations response:', response);
        setRecommendations(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchRecommendations();
    }
  }, [productId, type, limit]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg aspect-[3/4] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="py-4 md:py-8">
      <div className="flex items-center mb-4 md:mb-6">
        <Sparkles className="h-5 w-5 text-orange-600 mr-2" />
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h2>
      </div>
      
      {recommendations.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No related products found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {recommendations.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
