'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Eye, ShoppingCart, DollarSign } from 'lucide-react';
import axios from 'axios';

interface ProductAnalyticsProps {
  productId?: number;
  categoryId?: number;
}

export default function ProductAnalytics({ productId, categoryId }: ProductAnalyticsProps) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [period, setPeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [period, productId, categoryId]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setAnalytics({ views: [], sales: [], revenue: [] });
        return;
      }

      const params = new URLSearchParams({ period });
      if (productId) params.append('productId', productId.toString());
      if (categoryId) params.append('categoryId', categoryId.toString());

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/products/analytics?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnalytics((response as any).data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics({ views: [], sales: [], revenue: [] });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading analytics...</div>;
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Product Analytics</h3>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <Eye className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Views</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analytics?.views?.reduce((sum: number, item: any) => sum + item._count, 0) || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <ShoppingCart className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Sales</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analytics?.sales?.reduce((sum: number, item: any) => sum + (item._sum?.quantity || 0), 0) || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                KSh {(analytics?.revenue?.reduce((sum: number, item: any) => sum + (item._sum?.total || 0), 0) || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Chart */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h4 className="text-md font-semibold mb-4">Product Views</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics?.views || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="productId" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="_count" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sales Chart */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h4 className="text-md font-semibold mb-4">Sales Performance</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics?.sales || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="productId" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="_sum.quantity" stroke="#00C49F" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Distribution */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h4 className="text-md font-semibold mb-4">Revenue Distribution</h4>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={analytics?.revenue?.slice(0, 5) || []}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ productId, _sum }) => `Product ${productId}: KSh ${(_sum?.total || 0).toLocaleString()}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="_sum.total"
            >
              {(analytics?.revenue || []).slice(0, 5).map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any) => [`KSh ${value.toLocaleString()}`, 'Revenue']} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Top Performing Products Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-md font-semibold">Top Performing Products</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product ID
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics?.sales?.slice(0, 10).map((item: any, index: number) => {
                const views = analytics.views?.find((v: any) => v.productId === item.productId)?._count || 0;
                const sales = item._sum?.quantity || 0;
                const revenue = analytics.revenue?.find((r: any) => r.productId === item.productId)?._sum?.total || 0;
                const conversionRate = views > 0 ? ((sales / views) * 100).toFixed(2) : '0.00';

                return (
                  <tr key={item.productId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Product {item.productId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {views.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sales.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      KSh {revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {conversionRate}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
