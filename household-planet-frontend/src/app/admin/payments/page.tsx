'use client';

import { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Card, CardContent } from '../../../components/ui/Card';
import { CreditCard, TrendingUp, AlertCircle, CheckCircle, XCircle, Plus, Search, Filter } from 'lucide-react';
import axios from 'axios';
import { validateOrderId, formatOrderId, extractAmountFromOrderNumber } from '../../../lib/orderValidation';
import { useToast } from '../../../contexts/ToastContext';

interface PaymentStats {
  totalTransactions: number;
  completedTransactions: number;
  failedTransactions: number;
  pendingTransactions: number;
  refundedTransactions: number;
  totalRevenue: number;
  successRate: number;
  paymentTypeBreakdown: {
    [key: string]: {
      count: number;
      amount: number;
    };
  };
}

interface Transaction {
  id: number;
  amount: number;
  status: string;
  provider: string;
  paymentType: string;
  phoneNumber: string;
  mpesaReceiptNumber?: string;
  paybillReference?: string;
  cashReceivedBy?: string;
  notes?: string;
  createdAt: string;
  order?: {
    orderNumber: string;
    user: {
      name: string;
      email: string;
    };
  };
}

export default function AdminPaymentsPage() {
  const { showToast } = useToast();
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filters, setFilters] = useState({
    status: '',
    provider: '',
    search: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 50,
  });
  const [showCashForm, setShowCashForm] = useState(false);
  const [showPaybillForm, setShowPaybillForm] = useState(false);
  const [showPendingForm, setShowPendingForm] = useState(false);
  const [pendingForm, setPendingForm] = useState({ orderId: '', amount: '', phoneNumber: '', notes: '' });
  const [cashForm, setCashForm] = useState({ orderId: '', amount: '', receivedBy: '', notes: '' });
  const [paybillForm, setPaybillForm] = useState({ phoneNumber: '', amount: '', mpesaCode: '', reference: '', notes: '', orderId: '' });
  const [loading, setLoading] = useState(true);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [confirmRefund, setConfirmRefund] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [viewTransaction, setViewTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    fetchStats();
    fetchTransactions();
  }, [filters]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/admin/stats`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setStats((response as any).data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
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
      setTransactions((response as any).data.transactions || (response as any).data);
      setTotalTransactions((response as any).data.total || (response as any).data.length);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      showToast({ type: 'error', message: 'Failed to fetch transactions' });
    } finally {
      setLoading(false);
    }
  };

  const handleRefundClick = (transactionId: number) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;
    setSelectedTransaction(transaction);
    setShowRefundDialog(true);
    setConfirmRefund(false);
  };

  const processRefund = async () => {
    if (!selectedTransaction || !confirmRefund) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/admin/refund`,
        { transactionId: selectedTransaction.id, reason: 'Admin refund' },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      const refundNumber = `REF-${selectedTransaction.id}-${Date.now()}`;
      const orderInfo = selectedTransaction.order?.orderNumber ? ` for order ${selectedTransaction.order.orderNumber}` : '';
      const customerInfo = selectedTransaction.order?.user?.name ? ` to ${(selectedTransaction.order as any).user.name}` : '';
      
      showToast({ type: 'success', message: `💰 Refund of KSh ${selectedTransaction.amount.toLocaleString()}${orderInfo}${customerInfo} has been processed. Reference: ${refundNumber}` });
      setShowRefundDialog(false);
      setSelectedTransaction(null);
      fetchTransactions();
      fetchStats();
    } catch (error) {
      console.error('Error processing refund:', error);
      showToast({ type: 'error', message: '❌ Failed to process refund. Please try again or contact support.' });
    }
  };

  const generateInvoice = async (transaction: Transaction) => {
    try {
      const invoiceData = {
        invoiceNumber: `INV-${transaction.id}-${Date.now()}`,
        date: new Date().toLocaleDateString(),
        transaction,
        companyInfo: {
          name: 'Household Planet Kenya',
          address: 'Moi Avenue, Iconic Business Plaza, Basement Shop B10, Nairobi',
          phone: '+254790 227 760',
          email: 'householdplanet819@gmail.com'
        }
      };

      // Create HTML invoice
      const invoiceHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Invoice ${invoiceData.invoiceNumber}</title>
          <style>
            @page { size: A4 portrait; margin: 20mm; }
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20mm;
              color: #333; 
              background: #f5f5f5;
              min-height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .invoice-wrapper {
              width: 210mm;
              min-height: 297mm;
              background: white;
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
              position: relative;
            }
            .invoice-container {
              padding: 20mm;
              width: 100%;
              box-sizing: border-box;
            }
            .print-button {
              position: fixed;
              top: 20px;
              right: 20px;
              background: #16a34a;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 14px;
              font-weight: bold;
              box-shadow: 0 2px 10px rgba(0,0,0,0.2);
              z-index: 1000;
            }
            .print-button:hover {
              background: #15803d;
            }
            .header { text-align: center; border-bottom: 2px solid #16a34a; padding-bottom: 20px; margin-bottom: 30px; }
            .company-name { font-size: 28px; font-weight: bold; color: #16a34a; margin-bottom: 5px; }
            .invoice-title { font-size: 24px; color: #666; }
            .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .invoice-details, .customer-details { width: 48%; }
            .section-title { font-weight: bold; color: #16a34a; margin-bottom: 10px; }
            .transaction-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .transaction-table th, .transaction-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .transaction-table th { background-color: #f8f9fa; font-weight: bold; }
            .total-row { background-color: #16a34a; color: white; font-weight: bold; }
            .status-completed { color: #16a34a; font-weight: bold; }
            .status-pending { color: #f59e0b; font-weight: bold; }
            .status-failed { color: #dc2626; font-weight: bold; }
            .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
            @media print {
              body { 
                background: white;
                padding: 0;
                display: block;
              }
              .invoice-wrapper {
                width: 100%;
                min-height: auto;
                box-shadow: none;
                margin: 0;
              }
              .invoice-container {
                padding: 0;
              }
              .print-button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <button class="print-button" onclick="window.print()">🖨️ Print Invoice</button>
          <div class="invoice-wrapper">
            <div class="invoice-container">
              <div class="header">
            <div class="company-name">${invoiceData.companyInfo.name}</div>
            <div>${invoiceData.companyInfo.address}</div>
            <div>${invoiceData.companyInfo.phone} | ${invoiceData.companyInfo.email}</div>
            <div class="invoice-title">PAYMENT INVOICE</div>
          </div>

          <div class="invoice-info">
            <div class="invoice-details">
              <div class="section-title">Invoice Details</div>
              <div><strong>Invoice Number:</strong> ${invoiceData.invoiceNumber}</div>
              <div><strong>Date:</strong> ${invoiceData.date}</div>
              <div><strong>Transaction ID:</strong> ${transaction.id}</div>
            </div>
            <div class="customer-details">
              <div class="section-title">Customer Information</div>
              <div><strong>Name:</strong> ${transaction.order?.user?.name || 'N/A'}</div>
              <div><strong>Email:</strong> ${transaction.order?.user?.email || 'N/A'}</div>
              <div><strong>Phone:</strong> ${(transaction.order?.user as any)?.phone || transaction.phoneNumber || 'N/A'}</div>
              <div><strong>Order:</strong> ${transaction.order?.orderNumber || 'Manual Entry'}</div>
            </div>
          </div>

          <table class="transaction-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Payment Method</th>
                <th>Reference</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Payment for Order ${transaction.order?.orderNumber || 'Manual Entry'}</td>
                <td>${transaction.provider} - ${transaction.paymentType?.replace('_', ' ')}</td>
                <td>${transaction.mpesaReceiptNumber || transaction.paybillReference || 'N/A'}</td>
                <td class="status-${transaction.status.toLowerCase()}">${transaction.status}</td>
                <td>KSh ${transaction.amount.toLocaleString()}</td>
              </tr>
              <tr class="total-row">
                <td colspan="4"><strong>TOTAL AMOUNT</strong></td>
                <td><strong>KSh ${transaction.amount.toLocaleString()}</strong></td>
              </tr>
            </tbody>
          </table>

          ${transaction.notes ? `<div><strong>Notes:</strong> ${transaction.notes}</div>` : ''}
          ${transaction.cashReceivedBy ? `<div><strong>Cash Received By:</strong> ${transaction.cashReceivedBy}</div>` : ''}

          <div class="footer">
            <p>This is a computer-generated invoice. No signature required.</p>
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
            </div>
          </div>
        </body>
        </html>
      `;

      // Create and download HTML file
      const blob = new Blob([invoiceHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceData.invoiceNumber}.html`;
      a.click();
      URL.revokeObjectURL(url);

      showToast({ type: 'success', message: `Invoice ${invoiceData.invoiceNumber} downloaded successfully` });
    } catch (error) {
      console.error('Error generating invoice:', error);
      showToast({ type: 'error', message: 'Failed to generate invoice' });
    }
  };

  const recordCashPayment = async () => {
    // Validate form data
    if (!cashForm.orderId || !cashForm.amount || !cashForm.receivedBy) {
      showToast({ type: 'error', message: 'Please fill in all required fields (Order ID, Amount, Received By)' });
      return;
    }

    // Validate order ID format
    const orderValidation = validateOrderId(cashForm.orderId);
    if (!orderValidation.isValid) {
      showToast({ type: 'error', message: orderValidation.message || 'Invalid Order ID format' });
      return;
    }

    let orderId: number | string = cashForm.orderId;
    if (orderValidation.type === 'numeric') {
      orderId = parseInt(cashForm.orderId);
    }

    const amount = parseFloat(cashForm.amount);
    if (isNaN(amount) || amount <= 0) {
      showToast({ type: 'error', message: 'Please enter a valid amount' });
      return;
    }

    // Auto-suggest amount for WhatsApp orders
    if (orderValidation.type === 'orderNumber' && cashForm.orderId.startsWith('WA-')) {
      const suggestedAmount = extractAmountFromOrderNumber(cashForm.orderId);
      if (suggestedAmount && suggestedAmount !== amount) {
        const confirmAmount = confirm(
          `The order number suggests an amount of KSh ${suggestedAmount}. You entered KSh ${amount}. Continue with KSh ${amount}?`
        );
        if (!confirmAmount) return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/admin/cash-payment`,
        {
          orderId,
          amount,
          receivedBy: cashForm.receivedBy,
          notes: cashForm.notes
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      const orderInfo = (response as any).data.orderNumber ? ` for order ${(response as any).data.orderNumber}` : '';
      showToast({ type: 'success', message: `Cash payment recorded successfully${orderInfo}` });
      setCashForm({ orderId: '', amount: '', receivedBy: '', notes: '' });
      setShowCashForm(false);
      fetchTransactions();
      fetchStats();
    } catch (error) {
      console.error('Error recording cash payment:', error);
      showToast({ type: 'error', message: 'Failed to record cash payment. Please check if the order exists.' });
    }
  };

  const createPendingPayment = async () => {
    if (!pendingForm.orderId || !pendingForm.amount || !pendingForm.phoneNumber) {
      showToast({ type: 'error', message: 'Please fill in Order ID, Amount, and Phone Number' });
      return;
    }

    const amount = parseFloat(pendingForm.amount);
    if (isNaN(amount) || amount <= 0) {
      showToast({ type: 'error', message: 'Please enter a valid amount' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/admin/pending-payment`,
        {
          orderId: pendingForm.orderId,
          amount,
          phoneNumber: pendingForm.phoneNumber,
          notes: pendingForm.notes
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      showToast({ type: 'success', message: `⏳ Pending payment of KSh ${amount.toLocaleString()} created for tracking` });
      setPendingForm({ orderId: '', amount: '', phoneNumber: '', notes: '' });
      setShowPendingForm(false);
      fetchTransactions();
      fetchStats();
    } catch (error) {
      console.error('Error creating pending payment:', error);
      showToast({ type: 'error', message: 'Failed to create pending payment' });
    }
  };

  const recordPaybillPayment = async () => {
    // Validate form data
    if (!paybillForm.phoneNumber || !paybillForm.amount || !paybillForm.mpesaCode) {
      showToast({ type: 'error', message: 'Please fill in all required fields (Phone Number, Amount, M-Pesa Code)' });
      return;
    }

    const amount = parseFloat(paybillForm.amount);
    if (isNaN(amount) || amount <= 0) {
      showToast({ type: 'error', message: 'Please enter a valid amount' });
      return;
    }

    // Validate order ID if provided
    let orderId: number | string | undefined = undefined;
    if (paybillForm.orderId.trim()) {
      const orderValidation = validateOrderId(paybillForm.orderId);
      if (!orderValidation.isValid) {
        showToast({ type: 'error', message: orderValidation.message || 'Invalid Order ID format' });
        return;
      }
      
      orderId = orderValidation.type === 'numeric' 
        ? parseInt(paybillForm.orderId) 
        : paybillForm.orderId;

      // Auto-suggest amount for WhatsApp orders
      if (orderValidation.type === 'orderNumber' && paybillForm.orderId.startsWith('WA-')) {
        const suggestedAmount = extractAmountFromOrderNumber(paybillForm.orderId);
        if (suggestedAmount && suggestedAmount !== amount) {
          const confirmAmount = confirm(
            `The order number suggests an amount of KSh ${suggestedAmount}. You entered KSh ${amount}. Continue with KSh ${amount}?`
          );
          if (!confirmAmount) return;
        }
      }
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/admin/paybill-payment`,
        {
          phoneNumber: paybillForm.phoneNumber,
          amount,
          mpesaCode: paybillForm.mpesaCode,
          reference: paybillForm.reference || 'HouseholdPlanet',
          notes: paybillForm.notes,
          orderId
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      const orderInfo = (response as any).data.orderNumber ? ` for order ${(response as any).data.orderNumber}` : '';
      showToast({ type: 'success', message: `Paybill payment recorded successfully${orderInfo}` });
      setPaybillForm({ phoneNumber: '', amount: '', mpesaCode: '', reference: '', notes: '', orderId: '' });
      setShowPaybillForm(false);
      fetchTransactions();
      fetchStats();
    } catch (error) {
      console.error('Error recording paybill payment:', error);
      showToast({ type: 'error', message: 'Failed to record paybill payment. Please check if the order exists.' });
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
    <div className="px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Dashboard</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live updates enabled</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <CreditCard className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Total Transactions</p>
                    <p className="text-2xl font-bold">{stats.totalTransactions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold">KSh {stats.totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold">{stats.pendingTransactions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <XCircle className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Refunds</p>
                    <p className="text-2xl font-bold">{stats.refundedTransactions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>


        </>
      )}

      {/* Manual Payment Entry */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold mb-4">Record Manual Payments</h2>
        <div className="flex gap-4 mb-4">
          <Button onClick={() => setShowCashForm(!showCashForm)}>
            Record Cash Payment
          </Button>
          <Button onClick={() => setShowPaybillForm(!showPaybillForm)}>
            Record Paybill Payment
          </Button>
          <Button onClick={() => setShowPendingForm(!showPendingForm)} variant="outline">
            Create Pending Payment
          </Button>
        </div>

        {showCashForm && (
          <div className="border rounded-lg p-4 mb-4">
            <h3 className="font-medium mb-3">Cash Payment</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Order ID or Number (e.g., WA-1756163997824-4200)"
                value={cashForm.orderId}
                onChange={(e) => {
                  const value = e.target.value;
                  setCashForm({ ...cashForm, orderId: value });
                  
                  // Auto-fill amount for WhatsApp orders
                  if (value.startsWith('WA-') && value.length > 10) {
                    const suggestedAmount = extractAmountFromOrderNumber(value);
                    if (suggestedAmount && !cashForm.amount) {
                      setCashForm(prev => ({ ...prev, orderId: value, amount: suggestedAmount.toString() }));
                    }
                  }
                }}
                required
              />
              <Input
                placeholder="Amount (KSh)"
                type="number"
                value={cashForm.amount}
                onChange={(e) => setCashForm({ ...cashForm, amount: e.target.value })}
              />
              <Input
                placeholder="Received By"
                value={cashForm.receivedBy}
                onChange={(e) => setCashForm({ ...cashForm, receivedBy: e.target.value })}
              />
              <Input
                placeholder="Notes (optional)"
                value={cashForm.notes}
                onChange={(e) => setCashForm({ ...cashForm, notes: e.target.value })}
              />
            </div>
            <div className="flex gap-2 mt-3">
              <Button onClick={recordCashPayment}>Record Payment</Button>
              <Button variant="outline" onClick={() => setShowCashForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {showPaybillForm && (
          <div className="border rounded-lg p-4 mb-4">
            <h3 className="font-medium mb-3">Paybill Payment (247247)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Input
                placeholder="Phone Number"
                value={paybillForm.phoneNumber}
                onChange={(e) => setPaybillForm({ ...paybillForm, phoneNumber: e.target.value })}
              />
              <Input
                placeholder="Amount (KSh)"
                type="number"
                value={paybillForm.amount}
                onChange={(e) => setPaybillForm({ ...paybillForm, amount: e.target.value })}
              />
              <Input
                placeholder="M-Pesa Code"
                value={paybillForm.mpesaCode}
                onChange={(e) => setPaybillForm({ ...paybillForm, mpesaCode: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Order ID/Number (optional)"
                value={paybillForm.orderId}
                onChange={(e) => setPaybillForm({ ...paybillForm, orderId: e.target.value })}
              />
              <Input
                placeholder="Reference (optional)"
                value={paybillForm.reference}
                onChange={(e) => setPaybillForm({ ...paybillForm, reference: e.target.value })}
              />
              <Input
                placeholder="Notes (optional)"
                value={paybillForm.notes}
                onChange={(e) => setPaybillForm({ ...paybillForm, notes: e.target.value })}
              />
            </div>
            <div className="flex gap-2 mt-3">
              <Button onClick={recordPaybillPayment}>Record Payment</Button>
              <Button variant="outline" onClick={() => setShowPaybillForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {showPendingForm && (
          <div className="border rounded-lg p-4 mb-4 border-yellow-300 bg-yellow-50">
            <h3 className="font-medium mb-3 text-yellow-800">Create Pending Payment</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Order ID or Number"
                value={pendingForm.orderId}
                onChange={(e) => setPendingForm({ ...pendingForm, orderId: e.target.value })}
              />
              <Input
                placeholder="Amount (KSh)"
                type="number"
                value={pendingForm.amount}
                onChange={(e) => setPendingForm({ ...pendingForm, amount: e.target.value })}
              />
              <Input
                placeholder="Phone Number"
                value={pendingForm.phoneNumber}
                onChange={(e) => setPendingForm({ ...pendingForm, phoneNumber: e.target.value })}
              />
              <Input
                placeholder="Notes (optional)"
                value={pendingForm.notes}
                onChange={(e) => setPendingForm({ ...pendingForm, notes: e.target.value })}
              />
            </div>
            <div className="flex gap-2 mt-3">
              <Button onClick={createPendingPayment}>Create Pending</Button>
              <Button variant="outline" onClick={() => setShowPendingForm(false)}>Cancel</Button>
            </div>
          </div>
        )}
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400 h-4 w-4 pointer-events-none" />
                <Input
                  placeholder="Search by order number, customer name, email, or phone..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value, page: 1 })}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.provider} onValueChange={(value) => setFilters({ ...filters, provider: value, page: 1 })}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Providers</SelectItem>
                <SelectItem value="MPESA">M-Pesa</SelectItem>
                <SelectItem value="CASH">Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 1 })}
              placeholder="Start Date"
              className="w-full md:w-48"
            />
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value, page: 1 })}
              placeholder="End Date"
              className="w-full md:w-48"
            />
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setFilters({ status: '', provider: '', search: '', startDate: '', endDate: '', page: 1, limit: 50 })}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, totalTransactions)} of {totalTransactions} transactions
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
                disabled={filters.page <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                disabled={transactions.length < filters.limit}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {transaction.order?.orderNumber || 'Manual Entry'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div>
                          <div className="font-medium">{transaction.order?.user?.name || 'N/A'}</div>
                          <div className="text-gray-500">{(transaction.order?.user as any)?.phone || transaction.phoneNumber || 'N/A'}</div>
                          {transaction.cashReceivedBy && (
                            <div className="text-xs text-blue-600">Received by: {transaction.cashReceivedBy}</div>
                          )}
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
                        <div>
                          <div className="font-medium">{transaction.provider}</div>
                          <div className="text-xs text-gray-500">{transaction.paymentType?.replace('_', ' ')}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div>
                          {transaction.mpesaReceiptNumber && (
                            <div className="text-xs">M-Pesa: {transaction.mpesaReceiptNumber}</div>
                          )}
                          {transaction.paybillReference && (
                            <div className="text-xs">Ref: {transaction.paybillReference}</div>
                          )}
                          {transaction.notes && (
                            <div className="text-xs text-gray-500">
                              {transaction.notes.length > 30 ? `${transaction.notes.substring(0, 30)}...` : transaction.notes}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setViewTransaction(transaction);
                              setShowViewDialog(true);
                            }}
                          >
                            View
                          </Button>
                          {transaction.status === 'COMPLETED' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRefundClick(transaction.id)}
                            >
                              Refund
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateInvoice(transaction)}
                          >
                            Invoice
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Refund Confirmation Dialog */}
      {showRefundDialog && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Confirm Refund</h3>
            <div className="mb-4">
              <p className="text-gray-700 mb-2">
                Are you sure you want to process a refund for:
              </p>
              <div className="bg-gray-50 p-3 rounded border">
                <p><strong>Amount:</strong> KSh {selectedTransaction.amount.toLocaleString()}</p>
                <p><strong>Order:</strong> {selectedTransaction.order?.orderNumber || 'Manual Entry'}</p>
                <p><strong>Customer:</strong> {selectedTransaction.order?.user?.name || 'N/A'}</p>
              </div>
            </div>
            <div className="mb-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={confirmRefund}
                  onChange={(e) => setConfirmRefund(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">
                  I confirm that I want to process this refund
                </span>
              </label>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowRefundDialog(false);
                  setSelectedTransaction(null);
                  setConfirmRefund(false);
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={processRefund}
                disabled={!confirmRefund}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Process Refund
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Payment Details Dialog */}
      {showViewDialog && viewTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Payment Details</h3>
              <button
                onClick={() => {
                  setShowViewDialog(false);
                  setViewTransaction(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Transaction ID</label>
                  <p className="text-sm">{viewTransaction.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Amount</label>
                  <p className="text-sm font-semibold">KSh {viewTransaction.amount.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <p className={`text-sm font-medium ${
                    viewTransaction.status === 'COMPLETED' ? 'text-green-600' :
                    viewTransaction.status === 'FAILED' ? 'text-red-600' :
                    viewTransaction.status === 'REFUNDED' ? 'text-orange-600' :
                    'text-yellow-600'
                  }`}>{viewTransaction.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Provider</label>
                  <p className="text-sm">{viewTransaction.provider}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Payment Type</label>
                  <p className="text-sm">{viewTransaction.paymentType?.replace('_', ' ')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone Number</label>
                  <p className="text-sm">{viewTransaction.phoneNumber}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Order</label>
                  <p className="text-sm">{viewTransaction.order?.orderNumber || 'Manual Entry'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Customer</label>
                  <p className="text-sm">{viewTransaction.order?.user?.name || 'N/A'}</p>
                  <p className="text-xs text-gray-500">{viewTransaction.order?.user?.email || 'N/A'}</p>
                  <p className="text-xs text-gray-500">{(viewTransaction.order?.user as any)?.phone || viewTransaction.phoneNumber || 'N/A'}</p>
                </div>
                {viewTransaction.mpesaReceiptNumber && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">M-Pesa Receipt</label>
                    <p className="text-sm">{viewTransaction.mpesaReceiptNumber}</p>
                  </div>
                )}
                {viewTransaction.paybillReference && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Paybill Reference</label>
                    <p className="text-sm">{viewTransaction.paybillReference}</p>
                  </div>
                )}
                {viewTransaction.cashReceivedBy && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Cash Received By</label>
                    <p className="text-sm">{viewTransaction.cashReceivedBy}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-600">Date</label>
                  <p className="text-sm">{new Date(viewTransaction.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            {viewTransaction.notes && (
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-600">Notes</label>
                <p className="text-sm bg-gray-50 p-3 rounded border mt-1">{viewTransaction.notes}</p>
              </div>
            )}
            
            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => generateInvoice(viewTransaction)}
                variant="outline"
                className="flex-1"
              >
                Generate Invoice
              </Button>
              {viewTransaction.status === 'COMPLETED' && (
                <Button
                  onClick={() => {
                    setShowViewDialog(false);
                    handleRefundClick(viewTransaction.id);
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Process Refund
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
