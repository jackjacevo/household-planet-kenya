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
        const response = await api.get(`/products/${productId}/recommendations?type=${type}&limit=${limit}`) as any;
        setRecommendations(Array.isArray(response.data) ? response.data : []);
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
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
        <span className="ml-2 text-gray-600">Loading recommendations...</span>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="py-8">
      <div className="flex items-center mb-6">
        <Sparkles className="h-5 w-5 text-orange-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {recommendations.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}