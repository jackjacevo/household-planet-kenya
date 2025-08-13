'use client';

import { useState, useEffect } from 'react';
import { FiTrendingUp, FiUsers, FiShoppingBag, FiMapPin } from 'react-icons/fi';

interface SalesData {
  dailySales: Array<{ date: string; revenue: number; orders: number }>;
  weeklySales: Array<{ week: string; revenue: number; orders: number }>;
  monthlySales: Array<{ month: string; revenue: number; orders: number }>;
  topProducts: Array<{ productId: string; _sum: { quantity: number; total: number } }>;
}

interface CustomerData {
  newCustomers: Array<{ createdAt: string; _count: number }>;
  retentionRate: number;
  topCustomers: Array<{ name: string; email: string; totalSpent: number; _count: { orders: number } }>;
  customersByLocation: Array<{ county: string; _count: { county: number } }>;
}

interface ProductData {
  mostViewed: Array<{ name: string; viewCount: number; price: number }>;
  bestRated: Array<{ name: string; averageRating: number; totalReviews: number }>;
  inventoryStatus: { total: number; lowStock: number; outOfStock: number; inStock: number };
}

interface GeographicData {
  salesByCounty: Array<{ county: string; orderCount: number; totalRevenue: number }>;
  deliveryPerformance: Array<{ deliveryLocation: string; _count: { deliveryLocation: number } }>;
}

export default function AdminAnalytics() {
  const [activeTab, setActiveTab] = useState('sales');
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [geographicData, setGeographicData] = useState<GeographicData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [activeTab]);

  const fetchAnalyticsData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (activeTab === 'sales' && !salesData) {
        const response = await fetch('http://localhost:3001/api/admin/analytics/sales', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setSalesData(data);
      }
      
      if (activeTab === 'customers' && !customerData) {
        const response = await fetch('http://localhost:3001/api/admin/analytics/customers', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setCustomerData(data);
      }
      
      if (activeTab === 'products' && !productData) {
        const response = await fetch('http://localhost:3001/api/admin/analytics/products', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setProductData(data);
      }
      
      if (activeTab === 'geographic' && !geographicData) {
        const response = await fetch('http://localhost:3001/api/admin/analytics/geographic', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setGeographicData(data);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'sales', name: 'Sales Analytics', icon: FiTrendingUp },
    { id: 'customers', name: 'Customer Analytics', icon: FiUsers },
    { id: 'products', name: 'Product Analytics', icon: FiShoppingBag },
    { id: 'geographic', name: 'Geographic Analytics', icon: FiMapPin }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive business insights and performance metrics</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div>
            {/* Sales Analytics */}
            {activeTab === 'sales' && salesData && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Sales (Last 30 Days)</h3>
                    <div className="space-y-2">
                      {salesData.dailySales.slice(-7).map((day, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{day.date}</span>
                          <div className="text-right">
                            <span className="font-medium">KSh {day.revenue.toLocaleString()}</span>
                            <span className="text-xs text-gray-500 ml-2">({day.orders} orders)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Performance</h3>
                    <div className="space-y-2">
                      {salesData.monthlySales.slice(0, 6).map((month, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{month.month}</span>
                          <div className="text-right">
                            <span className="font-medium">KSh {month.revenue.toLocaleString()}</span>
                            <span className="text-xs text-gray-500 ml-2">({month.orders} orders)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Customer Analytics */}
            {activeTab === 'customers' && customerData && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Retention</h3>
                    <p className="text-3xl font-bold text-green-600">{customerData.retentionRate.toFixed(1)}%</p>
                    <p className="text-sm text-gray-500">Active in last 90 days</p>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Top Customers</h3>
                    <p className="text-3xl font-bold text-blue-600">{customerData.topCustomers.length}</p>
                    <p className="text-sm text-gray-500">High-value customers</p>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Geographic Spread</h3>
                    <p className="text-3xl font-bold text-purple-600">{customerData.customersByLocation.length}</p>
                    <p className="text-sm text-gray-500">Counties served</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Customers by Spending</h3>
                    <div className="space-y-3">
                      {customerData.topCustomers.slice(0, 5).map((customer, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">{customer.name}</p>
                            <p className="text-sm text-gray-500">{customer._count.orders} orders</p>
                          </div>
                          <span className="font-bold text-green-600">
                            KSh {customer.totalSpent.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Customers by Location</h3>
                    <div className="space-y-3">
                      {customerData.customersByLocation.slice(0, 5).map((location, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-gray-900">{location.county}</span>
                          <span className="font-medium text-blue-600">{location._count.county}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Product Analytics */}
            {activeTab === 'products' && productData && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Products</h3>
                    <p className="text-3xl font-bold text-blue-600">{productData.inventoryStatus.total}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">In Stock</h3>
                    <p className="text-3xl font-bold text-green-600">{productData.inventoryStatus.inStock}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Low Stock</h3>
                    <p className="text-3xl font-bold text-yellow-600">{productData.inventoryStatus.lowStock}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Out of Stock</h3>
                    <p className="text-3xl font-bold text-red-600">{productData.inventoryStatus.outOfStock}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Viewed Products</h3>
                    <div className="space-y-3">
                      {productData.mostViewed.slice(0, 5).map((product, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-500">KSh {product.price.toLocaleString()}</p>
                          </div>
                          <span className="font-bold text-blue-600">{product.viewCount} views</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Best Rated Products</h3>
                    <div className="space-y-3">
                      {productData.bestRated.slice(0, 5).map((product, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-500">{product.totalReviews} reviews</p>
                          </div>
                          <span className="font-bold text-yellow-600">⭐ {product.averageRating?.toFixed(1)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Geographic Analytics */}
            {activeTab === 'geographic' && geographicData && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by County</h3>
                    <div className="space-y-3">
                      {geographicData.salesByCounty.slice(0, 10).map((county, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">{county.county}</p>
                            <p className="text-sm text-gray-500">{county.orderCount} orders</p>
                          </div>
                          <span className="font-bold text-green-600">
                            KSh {county.totalRevenue.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Delivery Locations</h3>
                    <div className="space-y-3">
                      {geographicData.deliveryPerformance.slice(0, 10).map((location, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-gray-900">{location.deliveryLocation}</span>
                          <span className="font-medium text-blue-600">
                            {location._count.deliveryLocation} deliveries
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}