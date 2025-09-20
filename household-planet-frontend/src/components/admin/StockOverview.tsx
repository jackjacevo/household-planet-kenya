'use client';

import { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingDown, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import StockStatus from './StockStatus';
import axios from 'axios';

interface LowStockProduct {
  id: number;
  name: string;
  stock: number;
  lowStockThreshold: number;
  trackStock: boolean;
  images: string[];
}

interface StockOverviewProps {
  className?: string;
}

export default function StockOverview({ className = '' }: StockOverviewProps) {
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchLowStockProducts();
  }, []);

  const fetchLowStockProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/products?trackStock=true&lowStock=true&limit=50`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Handle different response structures and filter products
      const responseData = (response as any).data;
      let products = [];
      
      if (responseData.products && Array.isArray(responseData.products)) {
        products = responseData.products;
      } else if (responseData.data && Array.isArray(responseData.data)) {
        products = responseData.data;
      } else if (Array.isArray(responseData)) {
        products = responseData;
      }
      
      // Filter products that are actually low stock or out of stock
      const lowStock = products.filter((product: any) => 
        product.trackStock && (product.stock === 0 || product.stock <= product.lowStockThreshold)
      ) || [];
      
      setLowStockProducts(lowStock);
    } catch (error) {
      console.error('Error fetching low stock products:', error);
    } finally {
      setLoading(false);
    }
  };

  const outOfStockCount = lowStockProducts.filter(p => p.stock === 0).length;
  const lowStockCount = lowStockProducts.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold).length;
  const displayProducts = showAll ? lowStockProducts : lowStockProducts.slice(0, 5);

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Package className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Stock Alerts</h3>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="h-2 w-2 bg-red-500 rounded-full mr-2"></div>
              <span className="text-gray-600">{outOfStockCount} Out of Stock</span>
            </div>
            <div className="flex items-center">
              <div className="h-2 w-2 bg-yellow-500 rounded-full mr-2"></div>
              <span className="text-gray-600">{lowStockCount} Low Stock</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {lowStockProducts.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">All products are well stocked!</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {displayProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 mr-3">
                      <img
                        src={product.images[0] || '/images/products/placeholder.svg'}
                        alt={product.name}
                        className="h-10 w-10 rounded object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {product.name}
                      </p>
                      <StockStatus
                        stock={product.stock}
                        lowStockThreshold={product.lowStockThreshold}
                        trackStock={product.trackStock}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {product.stock === 0 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Critical
                      </span>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.location.href = `/admin/products?edit=${product.id}`}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Manage
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {lowStockProducts.length > 5 && (
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? 'Show Less' : `Show All ${lowStockProducts.length} Products`}
                </Button>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-200">
              <Button
                onClick={() => window.location.href = '/admin/products?filter=lowStock'}
                className="w-full"
              >
                <TrendingDown className="h-4 w-4 mr-2" />
                View All Stock Alerts
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
