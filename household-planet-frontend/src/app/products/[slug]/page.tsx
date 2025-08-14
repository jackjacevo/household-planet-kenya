'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { generateProductSchema } from '@/lib/seo';
import SchemaMarkup from '@/components/SEO/SchemaMarkup';
import Breadcrumbs from '@/components/SEO/Breadcrumbs';
import ProductImageGallery from '@/components/products/ProductImageGallery';
import ProductInfo from '@/components/products/ProductInfo';
import ProductTabs from '@/components/products/ProductTabs';
import RelatedProducts from '@/components/products/RelatedProducts';
import RecentlyViewed from '@/components/products/RecentlyViewed';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  comparePrice?: number;
  images: string[];
  averageRating: number;
  totalReviews: number;
  category: { name: string };
  stock: number;
  variants: ProductVariant[];
  specifications: any;
  sizeGuide?: string;
  deliveryInfo?: string;
  reviews: Review[];
}

interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
  attributes: any;
  size?: string;
  color?: string;
  material?: string;
}

interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  user: { name: string };
  images: string[];
  createdAt: string;
  isHelpful: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  useEffect(() => {
    if (params.slug) {
      fetchProduct(params.slug as string);
    }
  }, [params.slug]);

  const fetchProduct = async (slug: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/slug/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
        
        trackProductView(data.id);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackProductView = async (productId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}/view`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Error tracking product view:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
              <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { name: 'Products', url: '/products' },
    ...(product?.category ? [{ name: product.category.name, url: `/products?category=${product.category.name.toLowerCase()}` }] : []),
    { name: product.name, url: `/products/${params.slug}` },
  ];

  const productSchema = generateProductSchema({
    ...product,
    stockQuantity: product.stock,
    reviewCount: product.totalReviews,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <SchemaMarkup schema={productSchema} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbs.slice(0, -1)} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <ProductImageGallery images={product.images} productName={product.name} />
          <ProductInfo 
            product={product} 
            selectedVariant={selectedVariant}
            onVariantChange={setSelectedVariant}
          />
        </div>

        <ProductTabs product={product} />
        <RelatedProducts productId={product.id} />
        <RecentlyViewed currentProductId={product.id} />
      </div>
    </div>
  );
}