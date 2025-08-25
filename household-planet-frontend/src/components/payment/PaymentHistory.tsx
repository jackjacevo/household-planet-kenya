'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Receipt } from 'lucide-react';
import axios from 'axios';

interface PaymentTransaction {
  id: number;
  amount: number;
  status: string;
  provider: string;
  mpesaReceiptNumber?: string;
  transactionDate?: string;
  createdAt: string;
  order: {
    orderNumber: string;
    total: number;
    createdAt: string;
  };
}

export function PaymentHistory() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/history`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching payment history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'FAILED': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-600';
      case 'FAILED': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading payment history...</div>;
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <Receipt className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No payment history</h3>
        <p className="text-gray-600">Your payment transactions will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Payment History</h2>
      
      {transactions.map((transaction) => (
        <div key={transaction.id} className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              {getStatusIcon(transaction.status)}
              <span className={`ml-2 font-medium ${getStatusColor(transaction.status)}`}>
                {transaction.status}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              {new Date(transaction.createdAt).toLocaleDateString()}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Order Number</p>
              <p className="font-medium">{transaction.order.orderNumber}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Amount</p>
              <p className="font-medium">KSh {transaction.amount.toLocaleString()}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Payment Method</p>
              <p className="font-medium">{transaction.provider}</p>
            </div>
            
            {transaction.mpesaReceiptNumber && (
              <div>
                <p className="text-sm text-gray-600">M-Pesa Receipt</p>
                <p className="font-medium">{transaction.mpesaReceiptNumber}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}