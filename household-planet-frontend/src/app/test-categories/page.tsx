'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function TestCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('Fetching categories...');
        const data = await api.getCategoryHierarchy();
        console.log('Categories response:', data);
        setCategories((data as any[]) || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Categories Test Page</h1>
      
      {loading && <p>Loading categories...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}
      
      <div className="mb-4">
        <p>Total categories: {categories.length}</p>
      </div>
      
      <div className="grid gap-4">
        {categories.map((category: any) => (
          <div key={category.id} className="border p-4 rounded">
            <h3 className="font-bold">{category.name}</h3>
            <p>Slug: {category.slug}</p>
            <p>Description: {category.description}</p>
            <p>Image: {category.image}</p>
            <p>Children: {category.children?.length || 0}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
