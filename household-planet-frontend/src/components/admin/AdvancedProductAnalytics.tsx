'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Eye, ShoppingCart, DollarSign, Users, Calendar, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import axios from 'axios';

interface AnalyticsData {
  views: number;
  sales: number;
  revenue: number;
  conversionRate: number;
  avgRating: number;
  reviewCount: number;
}

interface ProductPerformance {
  id: number;
  name: string;
  views: number;
  sales: number;
  revenue: number;
  conversionRate: number;
}

export default function AdvancedProductAnalytics() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [topProducts, setTopProducts] = useState<ProductPerformance[]>([]);
  const [categoryPerformance, setCategoryPerformance] = useState([]);
  const [conversionFunnel, setConversionFunnel] = useState({
    views: 0,
    addToCarts: 0,
    purchases: 0
  });

  useEffect(() => {
    fetchAnalytics();
  }, [period, selectedProduct]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({ period });
      if (selectedProduct) params.append('productId', selectedProduct.toString());

      const [analyticsRes, productsRes, categoriesRes, conversionRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/products/analytics?${params}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/products/popular?period=${period}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/categories/performance`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/products/conversion-rates`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setAnalytics(analyticsRes.data);
      setTopProducts(productsRes.data);
      setCategoryPerformance(categoriesRes.data);
      setConversionFunnel(conversionRes.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/products/export-analytics?period=${period}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([(response as any).data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `product-analytics-${period}-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Analytics</h2>
          <p className="text-sm text-gray-600">Comprehensive insights into product performance</p>
        </div>
        <div className="flex gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="daily">Last 30 Days</option>
            <option value="weekly">Last 12 Weeks</option>
            <option value="monthly">Last 12 Months</option>
            <option value="yearly">Last 3 Years</option>
          </select>
          <Button onClick={exportReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.views.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.sales.toLocaleString()}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">KSh {analytics.revenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.conversionRate.toFixed(2)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      )}

      {/* Conversion Funnel */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-4">Conversion Funnel</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Eye className="h-5 w-5 text-blue-600 mr-2" />
              <span>Product Views</span>
            </div>
            <div className="flex items-center">
              <div className="w-64 bg-gray-200 rounded-full h-4 mr-4">
                <div className="bg-blue-600 h-4 rounded-full" style={{ width: '100%' }}></div>
              </div>
              <span className="font-semibold">{conversionFunnel.views.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ShoppingCart className="h-5 w-5 text-yellow-600 mr-2" />
              <span>Add to Cart</span>
            </div>
            <div className="flex items-center">
              <div className="w-64 bg-gray-200 rounded-full h-4 mr-4">
                <div 
                  className="bg-yellow-600 h-4 rounded-full" 
                  style={{ width: `${(conversionFunnel.addToCarts / conversionFunnel.views) * 100}%` }}
                ></div>
              </div>
              <span className="font-semibold">{conversionFunnel.addToCarts.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-green-600 mr-2" />
              <span>Purchases</span>
            </div>
            <div className="flex items-center">
              <div className="w-64 bg-gray-200 rounded-full h-4 mr-4">
                <div 
                  className="bg-green-600 h-4 rounded-full" 
                  style={{ width: `${(conversionFunnel.purchases / conversionFunnel.views) * 100}%` }}
                ></div>
              </div>
              <span className="font-semibold">{conversionFunnel.purchases.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Products */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Top Performing Products</h3>
          <div className="space-y-4">
            {topProducts.slice(0, 5).map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.sales} sales • {product.views} views</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">KSh {product.revenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">{product.conversionRate.toFixed(2)}% conversion</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Performance */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Category Performance</h3>
          <div className="space-y-4">
            {categoryPerformance.slice(0, 5).map((category: any, index) => (
              <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium text-gray-900">{category.name}</p>
                  <p className="text-sm text-gray-500">{category.productCount} products</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">KSh {category.totalRevenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">{category.totalSales} sales</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Trends Chart Placeholder */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-4">Performance Trends</h3>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-2" />
            <p>Chart visualization would be implemented here</p>
            <p className="text-sm">Consider integrating Chart.js or Recharts</p>
          </div>
        </div>
      </div>

      {/* Detailed Analytics Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Detailed Product Analytics</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversion Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg. Rating
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.views.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.sales.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    KSh {product.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.conversionRate > 5 
                        ? 'bg-green-100 text-green-800'
                        : product.conversionRate > 2
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.conversionRate.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ⭐ 4.5 (23 reviews)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
