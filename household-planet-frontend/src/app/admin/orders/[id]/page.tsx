'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Package, 
  User, 
  MapPin, 
  CreditCard, 
  Truck, 
  MessageSquare, 
  Mail, 
  Phone, 
  Send,
  Plus
} from 'lucide-react';

const WhatsAppIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516"/>
  </svg>
);

interface OrderDetails {
  id: number;
  orderNumber: string;
  status: string;
  total: number;
  subtotal: number;
  shippingCost: number;
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
  priority: string;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: any;
  deliveryLocation?: string;
  deliveryPrice?: number;
  source?: string;
  tags?: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  items: Array<{
    id: number;
    quantity: number;
    price: number;
    total: number;
    product: {
      id: number;
      name: string;
      images: string;
      sku: string;
    };
    variant?: {
      id: number;
      name: string;
      sku: string;
    };
  }>;
  notes: Array<{
    id: number;
    note: string;
    isInternal: boolean;
    createdAt: string;
    createdBy?: string;
  }>;
  statusHistory: Array<{
    id: number;
    status: string;
    notes?: string;
    createdAt: string;
    changedBy?: string;
  }>;
  communications: Array<{
    id: number;
    type: string;
    template?: string;
    subject?: string;
    message: string;
    sentAt: string;
    sentBy?: string;
  }>;
  paymentTransactions?: Array<{
    id: number;
    checkoutRequestId: string;
    status: string;
    amount: number;
    mpesaReceiptNumber?: string;
    createdAt: string;
  }>;
  delivery?: {
    id: number;
    trackingNumber: string;
    status: string;
    scheduledDate?: string;
    notes?: string;
  };
  returnRequests?: Array<{
    id: string;
    returnNumber: string;
    status: string;
    reason: string;
    createdAt: string;
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

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(true);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  useEffect(() => {
    if (params.id && (user?.role === 'ADMIN' || user?.role === 'STAFF')) {
      fetchOrderDetails();
    }
  }, [params.id, user]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (status: string, notes?: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${params.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status, notes }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      fetchOrderDetails();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const addOrderNote = async () => {
    if (!newNote.trim()) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${params.id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          note: newNote,
          isInternal: isInternalNote
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      setNewNote('');
      fetchOrderDetails();
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const sendCustomerEmail = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${params.id}/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          template: emailTemplate,
          subject: customSubject,
          customMessage: customMessage
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      setShowEmailDialog(false);
      setEmailTemplate('');
      setCustomSubject('');
      setCustomMessage('');
      fetchOrderDetails();
      alert('Email sent successfully!');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    }
  };

  const generateShippingLabel = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${params.id}/shipping-label`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      alert(`Shipping label generated. Tracking: ${data.trackingNumber}`);
      fetchOrderDetails();
    } catch (error) {
      console.error('Error generating shipping label:', error);
      alert('Failed to generate shipping label. Please try again.');
    }
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

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-900">Order not found</h2>
        <p className="text-gray-600 mt-2">The order you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-gray-900">Order {order.orderNumber}</h1>
              <div className="flex items-center space-x-2">
                {order.source === 'WHATSAPP' && (
                  <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                    <WhatsAppIcon />
                    WhatsApp
                  </Badge>
                )}
                {order.priority && order.priority !== 'NORMAL' && (
                  <Badge className={order.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                                  order.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'}>
                    {order.priority} Priority
                  </Badge>
                )}
                {order.tags && (
                  <Badge variant="outline">
                    {order.tags}
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-gray-600 space-y-1">
              <p>
                Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()} • 
                Last updated {new Date(order.updatedAt).toLocaleDateString()} at {new Date(order.updatedAt).toLocaleTimeString()}
              </p>
              <div className="flex items-center space-x-4 text-sm">
                <span>Source: {order.source || 'WEB'}</span>
                <span>Items: {order.items?.length || 0}</span>
                <span>Total: KSh {order.total.toLocaleString()}</span>
                {order.deliveryLocation && (
                  <span>Delivery: {order.deliveryLocation}</span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={statusColors[order.status as keyof typeof statusColors]}>
            {order.status}
          </Badge>
          <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Email Customer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Email to Customer</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Select value={emailTemplate} onValueChange={setEmailTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select email template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="order_confirmation">Order Confirmation</SelectItem>
                    <SelectItem value="shipping_notification">Shipping Notification</SelectItem>
                    <SelectItem value="delivery_confirmation">Delivery Confirmation</SelectItem>
                    <SelectItem value="custom">Custom Message</SelectItem>
                  </SelectContent>
                </Select>
                {emailTemplate === 'custom' && (
                  <>
                    <Input
                      placeholder="Email subject"
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                    />
                    <Textarea
                      placeholder="Email message"
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      rows={4}
                    />
                  </>
                )}
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={sendCustomerEmail} disabled={!emailTemplate}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={generateShippingLabel} disabled={order.status === 'DELIVERED' || order.status === 'CANCELLED'}>
            <Truck className="h-4 w-4 mr-2" />
            Generate Label
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Information Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Order ID:</span>
                  <p className="font-medium">{order.id}</p>
                </div>
                <div>
                  <span className="text-gray-500">Source:</span>
                  <p className="font-medium">{order.source || 'WEB'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Priority:</span>
                  <p className={`font-medium ${
                    order.priority === 'HIGH' ? 'text-orange-600' :
                    order.priority === 'URGENT' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {order.priority || 'NORMAL'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Items Count:</span>
                  <p className="font-medium">{order.items?.length || 0}</p>
                </div>
                <div>
                  <span className="text-gray-500">Subtotal:</span>
                  <p className="font-medium">KSh {order.subtotal.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-500">Shipping:</span>
                  <p className="font-medium">KSh {order.shippingCost.toLocaleString()}</p>
                </div>
                {order.deliveryPrice && (
                  <div>
                    <span className="text-gray-500">Delivery:</span>
                    <p className="font-medium">KSh {order.deliveryPrice.toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <span className="text-gray-500">Total:</span>
                  <p className="font-bold text-lg">KSh {order.total.toLocaleString()}</p>
                </div>
              </div>
              {order.tags && (
                <div className="mt-4 pt-4 border-t">
                  <span className="text-gray-500 text-sm">Tags:</span>
                  <p className="font-medium">{order.tags}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* WhatsApp Order Details */}
          {order.source === 'WHATSAPP' && order.notes && order.notes.length > 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center text-green-800">
                  <div className="w-5 h-5 mr-2">
                    <WhatsAppIcon />
                  </div>
                  WhatsApp Order Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-4 rounded-lg border">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700">
                    {order.notes.find(note => note.note.includes('WhatsApp Order Details'))?.note || order.notes[0]?.note}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Order Items ({order.items?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <img
                        src={item.product.images ? JSON.parse(item.product.images)[0] : '/images/placeholder.jpg'}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src = '/images/placeholder.jpg';
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product.name}</h4>
                        <p className="text-sm text-gray-600">SKU: {item.product.sku}</p>
                        {item.variant && (
                          <p className="text-sm text-gray-600">Variant: {item.variant.name}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Qty: {item.quantity}</p>
                        <p className="text-sm text-gray-600">KSh {item.price.toLocaleString()} each</p>
                        <p className="font-bold">KSh {item.total.toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No items found for this order</p>
                  </div>
                )}
              </div>
              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>KSh {order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping:</span>
                  <span>KSh {order.shippingCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t">
                  <span>Total:</span>
                  <span>KSh {order.total.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline & Communications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Status History */}
                <div>
                  <h4 className="font-medium mb-3">Status History</h4>
                  <div className="space-y-3">
                    {order.statusHistory.map((history) => (
                      <div key={history.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">Status changed to {history.status}</p>
                            <span className="text-sm text-gray-500">
                              {new Date(history.createdAt).toLocaleString()}
                            </span>
                          </div>
                          {history.notes && (
                            <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                          )}
                          {history.changedBy && (
                            <p className="text-xs text-gray-500">by {history.changedBy}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Communications */}
                {order.communications && order.communications.length > 0 && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">Customer Communications</h4>
                    <div className="space-y-3">
                      {order.communications.map((comm) => (
                        <div key={comm.id} className="bg-gray-50 p-3 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{comm.type}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(comm.sentAt).toLocaleString()}
                            </span>
                          </div>
                          {comm.subject && (
                            <p className="text-sm font-medium mb-1">{comm.subject}</p>
                          )}
                          <p className="text-sm text-gray-600">{comm.message}</p>
                          {comm.sentBy && (
                            <p className="text-xs text-gray-500 mt-1">Sent by: {comm.sentBy}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={order.status} onValueChange={(status) => updateOrderStatus(status)}>
                <SelectTrigger>
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
              {order.trackingNumber && (
                <div>
                  <label className="text-sm font-medium">Tracking Number</label>
                  <p className="text-sm text-gray-600">{order.trackingNumber}</p>
                </div>
              )}
              
              {/* Delivery Information */}
              {order.delivery && (
                <div className="pt-3 border-t">
                  <h4 className="text-sm font-medium mb-2">Delivery Details</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <span className="font-medium">{order.delivery.status}</span>
                    </div>
                    {order.delivery.scheduledDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Scheduled:</span>
                        <span className="font-medium">
                          {new Date(order.delivery.scheduledDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {order.delivery.notes && (
                      <div>
                        <span className="text-gray-500">Notes:</span>
                        <p className="text-gray-600 text-xs mt-1">{order.delivery.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Return Requests */}
              {order.returnRequests && order.returnRequests.length > 0 && (
                <div className="pt-3 border-t">
                  <h4 className="text-sm font-medium mb-2">Return Requests</h4>
                  <div className="space-y-2">
                    {order.returnRequests.map((returnReq) => (
                      <div key={returnReq.id} className="text-xs bg-gray-50 p-2 rounded">
                        <div className="flex justify-between">
                          <span>#{returnReq.returnNumber}</span>
                          <Badge className={returnReq.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                                          returnReq.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                          'bg-red-100 text-red-800'}>
                            {returnReq.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mt-1">{returnReq.reason}</p>
                        <p className="text-gray-500">{new Date(returnReq.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{order.user.name}</p>
                <p className="text-sm font-medium text-blue-600">
                  {order.user.email.endsWith('@whatsapp.temp') ? 'WhatsApp User' : order.user.email}
                </p>
                {order.user.phone && (
                  <p className="text-sm text-gray-600">{order.user.phone}</p>
                )}
              </div>
              <div className="flex space-x-2">
                {order.user.phone && (
                  <Button size="sm" variant="outline">
                    <Phone className="h-4 w-4 mr-1" />
                    Call
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.deliveryLocation && (
                <div>
                  <h4 className="font-medium mb-2">Delivery Location</h4>
                  <p className="text-sm text-gray-600">{order.deliveryLocation}</p>
                  {order.deliveryPrice && (
                    <p className="text-sm text-gray-600">Delivery Cost: KSh {order.deliveryPrice.toLocaleString()}</p>
                  )}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Delivery Cost:</span>
                  <p className="font-medium">KSh {order.shippingCost.toLocaleString()}</p>
                </div>
                {order.trackingNumber && (
                  <div>
                    <span className="text-gray-500">Tracking:</span>
                    <p className="font-medium">{order.trackingNumber}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Method:</span>
                  <p className="font-medium">
                    {order.paymentMethod === 'MPESA' ? 'M-Pesa' :
                     order.paymentMethod === 'CASH_ON_DELIVERY' ? 'Cash on Delivery' :
                     order.paymentMethod === 'CARD' ? 'Credit/Debit Card' :
                     order.paymentMethod}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <Badge className={order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 
                                  order.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'}>
                    {order.paymentStatus}
                  </Badge>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>KSh {order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping:</span>
                  <span>KSh {order.shippingCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>Total Amount:</span>
                  <span>KSh {order.total.toLocaleString()}</span>
                </div>
              </div>
              
              {order.paymentTransactions && order.paymentTransactions.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Payment Transactions</h4>
                  <div className="space-y-2">
                    {order.paymentTransactions.map((transaction: any) => (
                      <div key={transaction.id} className="text-xs bg-gray-50 p-2 rounded">
                        <div className="flex justify-between">
                          <span>ID: {transaction.checkoutRequestId}</span>
                          <Badge className={transaction.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {transaction.status}
                          </Badge>
                        </div>
                        {transaction.mpesaReceiptNumber && (
                          <p>Receipt: {transaction.mpesaReceiptNumber}</p>
                        )}
                        <p>Amount: KSh {transaction.amount.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="Add a note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={isInternalNote}
                      onChange={(e) => setIsInternalNote(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Internal note</span>
                  </label>
                  <Button size="sm" onClick={addOrderNote} disabled={!newNote.trim()}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Note
                  </Button>
                </div>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {order.notes.map((note) => (
                  <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">{note.note}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {new Date(note.createdAt).toLocaleString()}
                      </span>
                      <div className="flex items-center space-x-2">
                        {note.createdBy && (
                          <span className="text-xs text-gray-500">by {note.createdBy}</span>
                        )}
                        <Badge variant={note.isInternal ? 'secondary' : 'outline'} className="text-xs">
                          {note.isInternal ? 'Internal' : 'Customer'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}