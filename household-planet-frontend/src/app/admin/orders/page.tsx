'use client';

import { useState, useEffect } from 'react';
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
import Link from 'next/link';

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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkNotes, setBulkNotes] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    urgentOrders: []
  });
  const [returns, setReturns] = useState([]);
  const [showReturns, setShowReturns] = useState(false);

  useEffect(() => {
    if (user?.role === 'ADMIN' || user?.role === 'STAFF') {
      fetchOrders();
      fetchStats();
      if (showReturns) {
        fetchReturns();
      }
    }
  }, [user, pagination.page, statusFilter, searchTerm, showReturns]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { customerEmail: searchTerm })
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
        const errorText = await response.text();
        console.error('Orders API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          url: `${process.env.NEXT_PUBLIC_API_URL}/api/orders?${params}`
        });
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
      
      const data = await response.json();
      setOrders(data.orders || data || []);
      setPagination(prev => ({ ...prev, ...(data.pagination || data.meta || {}) }));
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Stats API Error:', {
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
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchReturns = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/returns`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
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
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/returns/process`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ returnId, status, notes }),
      });
      fetchReturns();
      alert(`Return ${status.toLowerCase()} successfully`);
    } catch (error) {
      console.error('Error processing return:', error);
    }
  };

  const updateOrderStatus = async (orderId: number, status: string, notes?: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status, notes }),
      });
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedOrders.length === 0) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/bulk/status`, {
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
      setSelectedOrders([]);
      setBulkAction('');
      setBulkNotes('');
      setShowBulkDialog(false);
      fetchOrders();
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const generateShippingLabel = async (orderId: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/shipping-label`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      alert(`Shipping label generated. Tracking: ${data.trackingNumber}`);
      fetchOrders();
    } catch (error) {
      console.error('Error generating shipping label:', error);
    }
  };

  const sendCustomerEmail = async (orderId: number, template: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ template }),
      });
      alert('Email sent successfully!');
    } catch (error) {
      console.error('Error sending email:', error);
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
        <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
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
            <div className="text-xl font-bold">KSh {stats.totalRevenue.toLocaleString()}</div>
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
          {loading ? (
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
                          <div className="font-medium">{order.orderNumber}</div>
                          {order.trackingNumber && (
                            <div className="text-sm text-gray-500">Track: {order.trackingNumber}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.user.name}</div>
                          <div className="text-sm text-gray-500">{order.user.email}</div>
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
                      <TableCell>{order.items.length} items</TableCell>
                      <TableCell>KSh {order.total.toLocaleString()}</TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Link href={`/admin/orders/${order.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateShippingLabel(order.id)}
                            disabled={order.status === 'DELIVERED' || order.status === 'CANCELLED'}
                          >
                            <Truck className="h-4 w-4" />
                          </Button>
                          <Select
                            value={order.status}
                            onValueChange={(status) => updateOrderStatus(order.id, status)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
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