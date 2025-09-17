'use client';

import { useState, useEffect } from 'react';
import { 
  ExclamationTriangleIcon, 
  BellIcon, 
  CogIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';

interface LowStockVariant {
  id: number;
  name: string;
  sku: string;
  stock: number;
  lowStockThreshold: number;
  price: number;
  product: {
    id: number;
    name: string;
    slug: string;
    category: {
      name: string;
    };
    brand?: {
      name: string;
    };
  };
}

interface AlertSettings {
  variantId: number;
  threshold: number;
  isActive: boolean;
}

export default function LowStockManager() {
  const [lowStockItems, setLowStockItems] = useState<LowStockVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingThreshold, setEditingThreshold] = useState<number | null>(null);
  const [newThreshold, setNewThreshold] = useState<number>(0);
  const [globalThreshold, setGlobalThreshold] = useState<number>(5);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadLowStockItems();
  }, [globalThreshold]);

  const loadLowStockItems = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/inventory/low-stock?threshold=${globalThreshold}`);
      setLowStockItems(response.data);
    } catch (error) {
      console.error('Error loading low stock items:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateThreshold = async (variantId: number, threshold: number) => {
    try {
      await api.post(`/products/variants/${variantId}/low-stock-alert`, { threshold });
      setEditingThreshold(null);
      loadLowStockItems();
    } catch (error) {
      console.error('Error updating threshold:', error);
    }
  };

  const startEditing = (variantId: number, currentThreshold: number) => {
    setEditingThreshold(variantId);
    setNewThreshold(currentThreshold);
  };

  const cancelEditing = () => {
    setEditingThreshold(null);
    setNewThreshold(0);
  };

  const getStockStatus = (stock: number, threshold: number) => {
    if (stock === 0) {
      return { label: 'Out of Stock', color: 'text-red-600 bg-red-100', icon: '🚫' };
    } else if (stock <= threshold) {
      return { label: 'Low Stock', color: 'text-orange-600 bg-orange-100', icon: '⚠️' };
    } else {
      return { label: 'In Stock', color: 'text-green-600 bg-green-100', icon: '✅' };
    }
  };

  const getUrgencyLevel = (stock: number, threshold: number) => {
    const ratio = stock / threshold;
    if (stock === 0) return 'critical';
    if (ratio <= 0.5) return 'high';
    if (ratio <= 1) return 'medium';
    return 'low';
  };

  const groupedItems = lowStockItems.reduce((acc, item) => {
    const urgency = getUrgencyLevel(item.stock, item.lowStockThreshold);
    if (!acc[urgency]) acc[urgency] = [];
    acc[urgency].push(item);
    return acc;
  }, {} as Record<string, LowStockVariant[]>);

  const urgencyOrder = ['critical', 'high', 'medium', 'low'];
  const urgencyLabels = {
    critical: 'Critical (Out of Stock)',
    high: 'High Priority',
    medium: 'Medium Priority',
    low: 'Low Priority'
  };

  const urgencyColors = {
    critical: 'border-red-500 bg-red-50',
    high: 'border-orange-500 bg-orange-50',
    medium: 'border-yellow-500 bg-yellow-50',
    low: 'border-blue-500 bg-blue-50'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <ExclamationTriangleIcon className="w-8 h-8 text-orange-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Low Stock Alerts</h2>
            <p className="text-gray-600">{lowStockItems.length} items need attention</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-2"
          >
            <CogIcon className="w-4 h-4" />
            <span>Settings</span>
          </button>
          
          <button
            onClick={loadLowStockItems}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <BellIcon className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Alert Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Global Low Stock Threshold
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  value={globalThreshold}
                  onChange={(e) => setGlobalThreshold(parseInt(e.target.value) || 5)}
                  className="w-24 border border-gray-300 rounded-md px-3 py-2"
                  min="1"
                />
                <span className="text-sm text-gray-600">
                  Show items with stock at or below this number
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {urgencyOrder.map(urgency => {
          const count = groupedItems[urgency]?.length || 0;
          return (
            <div key={urgency} className={`p-4 rounded-lg border-l-4 ${urgencyColors[urgency]}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {urgencyLabels[urgency]}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
                <div className="text-2xl">
                  {urgency === 'critical' ? '🚨' : 
                   urgency === 'high' ? '⚠️' : 
                   urgency === 'medium' ? '📊' : '📈'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Low Stock Items */}
      {lowStockItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <CheckIcon className="mx-auto h-12 w-12 text-green-500" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">All Good!</h3>
          <p className="mt-2 text-gray-600">No items are currently low on stock.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {urgencyOrder.map(urgency => {
            const items = groupedItems[urgency];
            if (!items || items.length === 0) return null;

            return (
              <div key={urgency} className="bg-white rounded-lg border">
                <div className={`px-6 py-4 border-b border-gray-200 ${urgencyColors[urgency]}`}>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {urgencyLabels[urgency]} ({items.length})
                  </h3>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {items.map((item) => {
                    const status = getStockStatus(item.stock, item.lowStockThreshold);
                    
                    return (
                      <div key={item.id} className="p-6 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-medium text-gray-900">
                                {item.product.name}
                              </h4>
                              {item.name !== item.product.name && (
                                <span className="text-sm text-gray-600">
                                  - {item.name}
                                </span>
                              )}
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                                {status.icon} {status.label}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-6 text-sm text-gray-600">
                              <span>SKU: {item.sku}</span>
                              <span>Category: {item.product.category.name}</span>
                              {item.product.brand && (
                                <span>Brand: {item.product.brand.name}</span>
                              )}
                              <span>Price: KSh {item.price.toLocaleString()}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="text-lg font-semibold text-gray-900">
                                {item.stock} units
                              </div>
                              <div className="text-sm text-gray-600">
                                Threshold: 
                                {editingThreshold === item.id ? (
                                  <div className="flex items-center space-x-2 mt-1">
                                    <input
                                      type="number"
                                      value={newThreshold}
                                      onChange={(e) => setNewThreshold(parseInt(e.target.value) || 0)}
                                      className="w-16 border border-gray-300 rounded px-2 py-1 text-xs"
                                      min="0"
                                    />
                                    <button
                                      onClick={() => updateThreshold(item.id, newThreshold)}
                                      className="text-green-600 hover:text-green-700"
                                    >
                                      <CheckIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={cancelEditing}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <XMarkIcon className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => startEditing(item.id, item.lowStockThreshold)}
                                    className="inline-flex items-center space-x-1 hover:text-blue-600"
                                  >
                                    <span>{item.lowStockThreshold}</span>
                                    <PencilIcon className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-col space-y-2">
                              <a
                                href={`/admin/products/${item.product.id}`}
                                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                Edit Product
                              </a>
                              <a
                                href={`/products/${item.product.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                              >
                                View
                              </a>
                            </div>
                          </div>
                        </div>
                        
                        {/* Stock Level Indicator */}
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Stock Level</span>
                            <span>{item.stock} / {item.lowStockThreshold} threshold</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                item.stock === 0 ? 'bg-red-500' :
                                item.stock <= item.lowStockThreshold * 0.5 ? 'bg-orange-500' :
                                item.stock <= item.lowStockThreshold ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ 
                                width: `${Math.min((item.stock / (item.lowStockThreshold * 2)) * 100, 100)}%` 
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
