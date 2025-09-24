'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import axios from 'axios';
import { SalesChart, CategoryChart, GeographicChart } from '@/components/admin/DashboardCharts';

interface SalesData {
  period: string;
  orders: number;
  revenue: number;
  avgOrderValue: number;
}

interface CategoryData {
  category: string;
  sales: number;
}

interface GeographicData {
  county: string;
  revenue: number;
  orders: number;
}

export default function AnalyticsPage() {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [geographicData, setGeographicData] = useState<GeographicData[]>([]);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [period]);

  const fetchAnalyticsData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [salesResponse, categoryResponse, geographicResponse] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/analytics/sales?period=${period}`, { headers }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/categories/popular?period=${period}`, { headers }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/analytics/geographic`, { headers })
      ]);
      
      setSalesData(salesResponse.data);
      setCategoryData(categoryResponse.data);
      setGeographicData(geographicResponse.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = salesData.reduce((sum, item) => sum + Number(item.revenue), 0);
  const totalOrders = salesData.reduce((sum, item) => sum + Number(item.orders), 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const maxRevenue = Math.max(...salesData.map(item => Number(item.revenue)));

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Sales Analytics</h1>
        <p className="mt-2 text-sm text-gray-700">
          Track your sales performance and identify trends over time.
        </p>
      </div>

      {/* Period Selector */}
      <div className="mb-6">
        <div className="flex space-x-4">
          {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                period === p
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Revenue
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    KSh {totalRevenue.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Orders
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {totalOrders.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Avg Order Value
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    KSh {avgOrderValue.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Trend Chart */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Sales & Orders Trend</h2>
          </div>
          <div className="p-6">
            {salesData.length > 0 ? (
              <SalesChart data={salesData} />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No data available for the selected period
              </div>
            )}
          </div>
        </div>

        {/* Category Performance */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Category Performance</h2>
          </div>
          <div className="p-6">
            {categoryData.length > 0 ? (
              <CategoryChart data={categoryData} />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                {loading ? 'Loading category data...' : 'No category data available'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Geographic Chart */}
      <div className="mt-8 bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Geographic Performance</h2>
        </div>
        <div className="p-6">
          {geographicData.length > 0 ? (
            <GeographicChart data={geographicData} />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              {loading ? 'Loading geographic data...' : 'No geographic data available'}
            </div>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="mt-8 bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Detailed Analytics</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Order Value
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salesData.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.period}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Number(item.orders).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    KSh {Number(item.revenue).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    KSh {Number(item.avgOrderValue).toLocaleString()}
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
