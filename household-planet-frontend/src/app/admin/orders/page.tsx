'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/Textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Eye, Download, Filter, Search, Mail, Package, FileText, MessageSquare, Truck, AlertCircle } from 'lucide-react';

const WhatsAppIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516"/>
  </svg>
);
import Link from 'next/link';
import { useToast } from '@/hooks/useToast';
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  trackingNumber?: string;
  priority: string;
  user: {
    name: string;
    email: string;
    phone?: string;
  };
  items: Array<{
    id: number;
    quantity: number;
    price: number;
    product: {
      name: string;
      images: string;
    };
    variant?: {
      name: string;
      sku: string;
    };
  }>;
  notes?: Array<{
    id: number;
    note: string;
    isInternal: boolean;
    createdAt: string;
    createdBy?: string;
  }>;
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
};

const priorityColors = {
  LOW: 'bg-green-100 text-green-800',
  NORMAL: 'bg-gray-100 text-gray-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};

export default function AdminOrdersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { refreshAll } = useRealtimeOrders();
  const [orders, setOrders] = useState<Order[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkNotes, setBulkNotes] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [returns, setReturns] = useState([]);
  const [showReturns, setShowReturns] = useState(false);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});



  const { data: stats = {
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    urgentOrders: []
  }, refetch: refetchStats } = useQuery({
    queryKey: ['orderStats'],
    queryFn: () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      
      return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` },
      }).then(response => {
        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      });
    },
    refetchInterval: 30000,
    enabled: !!(user?.role === 'ADMIN' || user?.role === 'STAFF')
  });

  const { data: ordersData, refetch: refetchOrders, isLoading } = useQuery({
    queryKey: ['orders', pagination.page, statusFilter, searchTerm],
    queryFn: () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { customerEmail: searchTerm })
      });

      return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      }).then(response => {
        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      });
    },
    refetchInterval: 60000,
    enabled: !!(user?.role === 'ADMIN' || user?.role === 'STAFF')
  });

  useEffect(() => {
    if (ordersData) {
      setOrders(ordersData.orders || []);
      setPagination(prev => ({ ...prev, ...(ordersData.pagination || {}) }));
    }
  }, [ordersData]);

  useEffect(() => {
    if (showReturns && (user?.role === 'ADMIN' || user?.role === 'STAFF')) {
      fetchReturns();
    }
  }, [showReturns, user]);



  const fetchReturns = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/returns`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Returns API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
      
      const data = await response.json();
      setReturns(data);
    } catch (error) {
      console.error('Error fetching returns:', error);
      setReturns([]);
    }
  };

  const processReturn = async (returnId: string, status: string, notes?: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/returns/process`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ returnId, status, notes }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      fetchReturns();
      toast({
        title: 'Success!',
        description: `Return ${status.toLowerCase()} successfully`,
        variant: 'success'
      });
    } catch (error) {
      console.error('Error processing return:', error);
      toast({
        title: 'Error',
        description: 'Failed to process return. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const updateOrderStatus = async (orderId: number, status: string, notes?: string) => {
    const loadingKey = `status-${orderId}`;
    setActionLoading(prev => ({ ...prev, [loadingKey]: true }));
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status, notes }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      // Show success message
      const orderNumber = orders.find(o => o.id === orderId)?.orderNumber || orderId;
      toast({
        title: 'Success!',
        description: `Order ${orderNumber} status updated to ${status} successfully!`,
        variant: 'success'
      });
      
      refetchOrders();
      refetchStats();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Error',
        description: `Failed to update order status: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedOrders.length === 0) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/bulk/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          orderIds: selectedOrders,
          status: bulkAction,
          notes: bulkNotes
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      setSelectedOrders([]);
      setBulkAction('');
      setBulkNotes('');
      setShowBulkDialog(false);
      refetchOrders();
      refetchStats();
      toast({
        title: 'Success!',
        description: `Bulk action completed for ${selectedOrders.length} orders`,
        variant: 'success'
      });
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast({
        title: 'Error',
        description: 'Failed to perform bulk action. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const generateShippingLabel = async (orderId: number) => {
    const loadingKey = `shipping-${orderId}`;
    setActionLoading(prev => ({ ...prev, [loadingKey]: true }));
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/shipping-label`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      toast({
        title: 'Success!',
        description: `Shipping label generated. Tracking: ${data.trackingNumber}`,
        variant: 'success'
      });
      refetchOrders();
      refetchStats();
    } catch (error) {
      console.error('Error generating shipping label:', error);
      toast({
        title: 'Error',
        description: `Failed to generate shipping label: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const sendCustomerEmail = async (orderId: number, template: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ template }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      toast({
        title: 'Success!',
        description: 'Email sent successfully!',
        variant: 'success'
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: 'Error',
        description: 'Failed to send email. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const toggleOrderSelection = (orderId: number) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const selectAllOrders = () => {
    setSelectedOrders(
      selectedOrders.length === orders.length 
        ? [] 
        : orders.map(order => order.id)
    );
  };

  if (!user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live updates: Stats 30s, Orders 60s</span>
          </div>
        </div>
        <div className="flex space-x-2">
          {selectedOrders.length > 0 && (
            <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  Bulk Actions ({selectedOrders.length})
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bulk Update Orders</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Select value={bulkAction} onValueChange={setBulkAction}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CONFIRMED">Mark as Confirmed</SelectItem>
                      <SelectItem value="PROCESSING">Mark as Processing</SelectItem>
                      <SelectItem value="SHIPPED">Mark as Shipped</SelectItem>
                      <SelectItem value="DELIVERED">Mark as Delivered</SelectItem>
                      <SelectItem value="CANCELLED">Mark as Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Textarea
                    placeholder="Add notes (optional)"
                    value={bulkNotes}
                    onChange={(e) => setBulkNotes(e.target.value)}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleBulkAction}>
                      Update Orders
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">KSh {(stats.totalRevenue || 0).toLocaleString()}</div>
            {stats.deliveredRevenue !== undefined && (
              <div className="text-xs text-gray-500 mt-1">
                Delivered: KSh {(stats.deliveredRevenue || 0).toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.processingOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Shipped</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{stats.shippedOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.deliveredOrders}</div>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Orders Alert */}
      {stats.urgentOrders.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <span className="font-medium text-orange-800">
                {stats.urgentOrders.length} orders need immediate attention (pending &gt; 24h)
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by order number, customer email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Orders and Returns */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setShowReturns(false)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              !showReturns
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setShowReturns(true)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              showReturns
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Returns
          </button>
        </div>
      </div>

      {/* Orders/Returns Table */}
      <Card>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : showReturns ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Return #</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {returns.map((returnReq: any) => (
                  <TableRow key={returnReq.id}>
                    <TableCell className="font-medium">{returnReq.returnNumber}</TableCell>
                    <TableCell>{returnReq.order.orderNumber}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{returnReq.order.user.name}</div>
                        <div className="text-sm text-gray-500">{returnReq.order.user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{returnReq.reason}</TableCell>
                    <TableCell>
                      <Badge className={returnReq.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                                      returnReq.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                                      'bg-red-100 text-red-800'}>
                        {returnReq.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(returnReq.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {returnReq.status === 'PENDING' && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => processReturn(returnReq.id, 'APPROVED')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => processReturn(returnReq.id, 'REJECTED')}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedOrders.length === orders.length}
                        onCheckedChange={selectAllOrders}
                      />
                    </TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedOrders.includes(order.id)}
                          onCheckedChange={() => toggleOrderSelection(order.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{order.orderNumber}</span>
                            {order.source === 'WHATSAPP' && (
                              <Badge className="bg-green-100 text-green-800 text-xs flex items-center gap-1">
                                <WhatsAppIcon />
                                WA
                              </Badge>
                            )}
                          </div>
                          {order.trackingNumber && (
                            <div className="text-sm text-gray-500">Track: {order.trackingNumber}</div>
                          )}
                          {order.deliveryLocation && (
                            <div className="text-sm text-gray-500">Delivery: {order.deliveryLocation}</div>
                          )}
                          <div className="text-xs text-gray-400">
                            {order.paymentMethod === 'MPESA' ? 'M-Pesa' :
                             order.paymentMethod === 'CASH_ON_DELIVERY' ? 'COD' :
                             order.paymentMethod}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.user.name}</div>
                          <div className="text-sm text-blue-600 font-medium">
                            {order.user.email.endsWith('@whatsapp.temp') ? 'WhatsApp User' : order.user.email}
                          </div>
                          {order.user.phone && (
                            <div className="text-sm text-gray-500">{order.user.phone}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                            {order.status}
                          </Badge>
                          {order.priority !== 'NORMAL' && (
                            <Badge className={priorityColors[order.priority as keyof typeof priorityColors]} variant="outline">
                              {order.priority}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-medium">{order.items?.length || 0} items</span>
                          <div className="text-sm text-gray-500">
                            Subtotal: KSh {order.subtotal?.toLocaleString() || order.total.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-400">
                            Delivery: {order.shippingCost === 0 ? 'FREE' : `KSh ${order.shippingCost.toLocaleString()}`}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-bold">KSh {order.total.toLocaleString()}</span>
                          {order.deliveryPrice && order.deliveryPrice !== order.shippingCost && (
                            <div className="text-xs text-gray-500">
                              +KSh {order.deliveryPrice.toLocaleString()} delivery
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</div>
                          {order.updatedAt !== order.createdAt && (
                            <div className="text-xs text-gray-400">
                              Updated: {new Date(order.updatedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Link href={`/admin/orders/${order.id}`}>
                            <Button variant="outline" size="sm" title="View Order Details">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateShippingLabel(order.id)}
                            disabled={order.status === 'DELIVERED' || order.status === 'CANCELLED' || actionLoading[`shipping-${order.id}`]}
                            title="Generate Shipping Label"
                          >
                            {actionLoading[`shipping-${order.id}`] ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                            ) : (
                              <Truck className="h-4 w-4" />
                            )}
                          </Button>
                          <Select
                            value={order.status}
                            onValueChange={(status) => {
                              updateOrderStatus(order.id, status);
                            }}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="z-50">
                              <SelectItem value="PENDING">Pending</SelectItem>
                              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                              <SelectItem value="PROCESSING">Processing</SelectItem>
                              <SelectItem value="SHIPPED">Shipped</SelectItem>
                              <SelectItem value="DELIVERED">Delivered</SelectItem>
                              <SelectItem value="CANCELLED">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} orders
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}