'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, CreditCard, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface PaymentAnalytics {
  totalVolume: number;
  transactionCount: number;
  averageAmount: number;
  byProvider: Record<string, number>;
  byStatus: Record<string, number>;
  dailyTrends: Array<{ date: string; count: number; amount: number }>;
}

export default function PaymentAnalytics() {
  const [analytics, setAnalytics] = useState<PaymentAnalytics | null>(null);
  const [period, setPeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/admin/analytics?period=${period}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading analytics...</div>;
  if (!analytics) return <div>No analytics data available</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Payment Analytics</h2>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Volume</p>
              <p className="text-2xl font-bold">KSh {analytics.totalVolume.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <CreditCard className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Transactions</p>
              <p className="text-2xl font-bold">{analytics.transactionCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Average Amount</p>
              <p className="text-2xl font-bold">KSh {analytics.averageAmount.toFixed(0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Failed Rate</p>
              <p className="text-2xl font-bold">
                {((analytics.byStatus.FAILED || 0) / analytics.transactionCount * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Provider Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">By Provider</h3>
          <div className="space-y-3">
            {Object.entries(analytics.byProvider).map(([provider, count]) => (
              <div key={provider} className="flex justify-between items-center">
                <span className="text-gray-600">{provider}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">By Status</h3>
          <div className="space-y-3">
            {Object.entries(analytics.byStatus).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="text-gray-600">{status}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Trends */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Daily Trends</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Date</th>
                <th className="text-right py-2">Transactions</th>
                <th className="text-right py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {analytics.dailyTrends.slice(-7).map((trend) => (
                <tr key={trend.date} className="border-b">
                  <td className="py-2">{new Date(trend.date).toLocaleDateString()}</td>
                  <td className="text-right py-2">{trend.count}</td>
                  <td className="text-right py-2">KSh {trend.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}