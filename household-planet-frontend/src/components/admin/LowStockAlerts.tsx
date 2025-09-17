'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Package, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';

interface LowStockAlert {
  id: string;
  threshold: number;
  isActive: boolean;
  createdAt: string;
  variant: {
    id: string;
    name: string;
    sku: string;
    stock: number;
    product: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

export function LowStockAlerts() {
  const [alerts, setAlerts] = useState<LowStockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await api.getLowStockAlerts() as any;
      setAlerts((response as any).data || []);
    } catch (error) {
      console.error('Error fetching low stock alerts:', error);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshAlerts = async () => {
    try {
      setRefreshing(true);
      await fetchAlerts();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
        <span className="ml-2 text-gray-600">Loading alerts...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">Low Stock Alerts</h2>
          {alerts.length > 0 && (
            <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {alerts.length}
            </span>
          )}
        </div>
        <Button
          onClick={refreshAlerts}
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-8">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Low Stock Alerts</h3>
          <p className="text-gray-600">All products are well stocked!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">
                    {alert.variant.product.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Variant: {alert.variant.name} (SKU: {alert.variant.sku})
                  </p>
                  <p className="text-sm text-red-600 font-medium">
                    Only {alert.variant.stock} items left (Threshold: {alert.threshold})
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  onClick={() => window.open(`/admin/products/${alert.variant.product.id}`, '_blank')}
                >
                  Manage Stock
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
