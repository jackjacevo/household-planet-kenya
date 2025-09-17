'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Download, Filter, Search } from 'lucide-react';
import axios from 'axios';

interface ReconciliationData {
  totalTransactions: number;
  totalAmount: number;
  successfulTransactions: number;
  failedTransactions: number;
  refundedTransactions: number;
  discrepancies: Array<{
    id: number;
    type: string;
    description: string;
    amount: number;
  }>;
}

export default function PaymentReconciliation() {
  const [data, setData] = useState<ReconciliationData | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  const fetchReconciliationData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/admin/transactions`,
        {
          params: dateRange,
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      const transactions = response.data;
      const reconciliation = {
        totalTransactions: transactions.length,
        totalAmount: transactions.reduce((sum: number, t: any) => sum + Number(t.amount), 0),
        successfulTransactions: transactions.filter((t: any) => t.status === 'COMPLETED').length,
        failedTransactions: transactions.filter((t: any) => t.status === 'FAILED').length,
        refundedTransactions: transactions.filter((t: any) => t.status === 'REFUNDED').length,
        discrepancies: [] // Would be populated with actual discrepancy logic
      };

      setData(reconciliation);
    } catch (error) {
      console.error('Error fetching reconciliation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/admin/transactions`,
        {
          params: { ...dateRange, limit: 10000 },
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      const csvContent = [
        'Date,Order,Customer,Amount,Status,Provider,Receipt',
        ...response.data.map((t: any) => [
          new Date(t.createdAt).toLocaleDateString(),
          t.order?.orderNumber || 'N/A',
          t.order?.user?.name || 'N/A',
          t.amount,
          t.status,
          t.provider,
          t.mpesaReceiptNumber || 'N/A'
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payment-reconciliation-${dateRange.startDate}-${dateRange.endDate}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  useEffect(() => {
    fetchReconciliationData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Payment Reconciliation</h2>
        <Button onClick={exportReport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Report Period</h3>
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <Input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <Input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
          <Button onClick={fetchReconciliationData} disabled={loading}>
            <Filter className="h-4 w-4 mr-2" />
            {loading ? 'Loading...' : 'Generate Report'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-600">Total Transactions</h3>
            <p className="text-3xl font-bold text-blue-600">{data.totalTransactions}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-600">Total Amount</h3>
            <p className="text-3xl font-bold text-green-600">
              KSh {data.totalAmount.toLocaleString()}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-600">Success Rate</h3>
            <p className="text-3xl font-bold text-green-600">
              {data.totalTransactions > 0 
                ? ((data.successfulTransactions / data.totalTransactions) * 100).toFixed(1)
                : 0}%
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-600">Failed Transactions</h3>
            <p className="text-3xl font-bold text-red-600">{data.failedTransactions}</p>
          </div>
        </div>
      )}

      {/* Reconciliation Status */}
      {data && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Reconciliation Status</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <div>
                <h4 className="font-medium text-green-800">Successful Payments</h4>
                <p className="text-sm text-green-600">{data.successfulTransactions} transactions</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-800">
                  KSh {(data.totalAmount * (data.successfulTransactions / data.totalTransactions)).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
              <div>
                <h4 className="font-medium text-red-800">Failed Payments</h4>
                <p className="text-sm text-red-600">{data.failedTransactions} transactions</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-red-600">Requires investigation</p>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
              <div>
                <h4 className="font-medium text-yellow-800">Refunded Payments</h4>
                <p className="text-sm text-yellow-600">{data.refundedTransactions} transactions</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-yellow-600">Processed refunds</p>
              </div>
            </div>
          </div>

          {data.discrepancies.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-red-800 mb-3">Discrepancies Found</h4>
              <div className="space-y-2">
                {data.discrepancies.map((discrepancy) => (
                  <div key={discrepancy.id} className="p-3 bg-red-50 border border-red-200 rounded">
                    <p className="font-medium text-red-800">{discrepancy.type}</p>
                    <p className="text-sm text-red-600">{discrepancy.description}</p>
                    <p className="text-sm font-medium">Amount: KSh {discrepancy.amount}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
