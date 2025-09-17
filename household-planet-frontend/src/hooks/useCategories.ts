'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: number;
  isActive: boolean;
  children: Category[];
  _count: { products: number };
}

interface MappedCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
}

const fallbackImages = [
  'https://images.unsplash.com/photo-1600585152220-90363fe7e115?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
];

export function useCategories(autoRefresh = true, refreshInterval = 30000, showNotifications = false) {
  const [categories, setCategories] = useState<MappedCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const previousCategoriesRef = useRef<MappedCategory[]>([]);
  const isInitialLoad = useRef(true);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/categories`;
      console.log('🔍 useCategories - Fetching from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
      }
      
      const data: Category[] = await response.json();
      console.log('🔍 useCategories - Raw data:', data);
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format: expected array');
      }
      
      // Filter only parent categories (parentId is null) and active ones
      const parentCategories = data.filter((cat: Category) => !cat.parentId && cat.isActive);
      console.log('🔍 useCategories - Parent categories found:', parentCategories.length);
      
      const mappedCategories: MappedCategory[] = parentCategories.map((cat: Category, index: number) => {
        // Use backend image if available, otherwise fallback
        const categoryImage = cat.image || fallbackImages[index % fallbackImages.length];
        console.log(`🔍 Category ${cat.name}: image = ${categoryImage}, children = ${cat.children?.length || 0}`);
        
        return {
          id: cat.id.toString(),
          name: cat.name,
          slug: cat.slug,
          description: cat.description || 'Explore our quality products in this category',
          image: categoryImage,
          productCount: cat.children?.length || cat._count?.products || 0
        };
      });
      
      console.log('🔍 useCategories - Mapped categories:', mappedCategories);
      
      // Check for changes and show notifications if enabled
      if (showNotifications && !isInitialLoad.current && previousCategoriesRef.current.length > 0) {
        const hasChanges = JSON.stringify(mappedCategories) !== JSON.stringify(previousCategoriesRef.current);
        if (hasChanges) {
          // We'll handle notifications in the component that uses this hook
          console.log('🔄 Categories updated!');
        }
      }
      
      previousCategoriesRef.current = mappedCategories;
      setCategories(mappedCategories);
      setLastUpdated(new Date());
      
      if (isInitialLoad.current) {
        isInitialLoad.current = false;
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('❌ useCategories - Error:', errorMessage);
      setError(errorMessage);
      
      // Don't clear categories on error, keep showing last successful data
      if (categories.length === 0) {
        setCategories([]);
      }
    } finally {
      setLoading(false);
    }
  }, [categories.length]);

  const refreshCategories = useCallback(() => {
    console.log('🔄 Manual refresh triggered');
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh triggered');
      fetchCategories();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchCategories]);

  return {
    categories,
    loading,
    error,
    lastUpdated,
    refreshCategories,
    fetchCategories,
    hasChanges: !isInitialLoad.current && previousCategoriesRef.current.length > 0 && 
                JSON.stringify(categories) !== JSON.stringify(previousCategoriesRef.current)
  };
}
