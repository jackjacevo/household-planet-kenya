'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CreditCard, TrendingUp, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';

interface PaymentStats {
  totalTransactions: number;
  completedTransactions: number;
  failedTransactions: number;
  pendingTransactions: number;
  totalRevenue: number;
  successRate: number;
}

interface Transaction {
  id: number;
  amount: number;
  status: string;
  provider: string;
  phoneNumber: string;
  mpesaReceiptNumber?: string;
  createdAt: string;
  order: {
    orderNumber: string;
    user: {
      name: string;
      email: string;
    };
  };
}

export default function AdminPaymentsPage() {
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filters, setFilters] = useState({
    status: '',
    provider: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 50,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchTransactions();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/admin/stats`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/admin/transactions?${params}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      alert('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (transactionId: number) => {
    if (!confirm('Are you sure you want to process this refund?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/admin/refund`,
        { transactionId, reason: 'Admin refund' },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      alert('Refund processed successfully');
      fetchTransactions();
      fetchStats();
    } catch (error) {
      console.error('Error processing refund:', error);
      alert('Failed to process refund');
    }
  };

  const generateInvoice = async (orderId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/admin/invoice/${orderId}`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // Create and download PDF (simplified)
      const invoice = response.data;
      const blob = new Blob([JSON.stringify(invoice, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoice.invoiceNumber}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Failed to generate invoice');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'FAILED': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-600 bg-green-100';
      case 'FAILED': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Payment Dashboard</h1>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold">{stats.totalTransactions}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">KSh {stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{stats.pendingTransactions}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
          </select>
          
          <select
            value={filters.provider}
            onChange={(e) => setFilters({ ...filters, provider: e.target.value })}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">All Providers</option>
            <option value="MPESA">M-Pesa</option>
            <option value="MPESA_C2B">M-Pesa C2B</option>
          </select>
          
          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            placeholder="Start Date"
          />
          
          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            placeholder="End Date"
          />
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button onClick={fetchTransactions}>
            Apply Filters
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
            disabled={filters.page <= 1}
          >
            Previous
          </Button>
          <span className="px-3 py-2 text-sm">Page {filters.page}</span>
          <Button 
            variant="outline" 
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
            disabled={transactions.length < filters.limit}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {transaction.order?.orderNumber || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div>
                      <div className="font-medium">{transaction.order?.user?.name || 'N/A'}</div>
                      <div className="text-gray-500">{transaction.phoneNumber}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    KSh {transaction.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {getStatusIcon(transaction.status)}
                      <span className="ml-1">{transaction.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {transaction.provider}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      {transaction.status === 'COMPLETED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRefund(transaction.id)}
                        >
                          Refund
                        </Button>
                      )}
                      {transaction.order && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateInvoice(transaction.order.id)}
                        >
                          Invoice
                        </Button>
                      )}
                    </div>
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