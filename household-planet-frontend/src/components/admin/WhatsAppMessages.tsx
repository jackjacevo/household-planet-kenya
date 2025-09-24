'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/contexts/ToastContext';
import { api } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';

interface WhatsAppMessage {
  id: number;
  phoneNumber: string;
  message: string;
  timestamp: string;
  messageId?: string;
  isOrderCandidate: boolean;
  processed: boolean;
  orderId?: number;
}

interface WhatsAppOrder {
  id: number;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  user: {
    name: string;
    email: string;
    phone: string;
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
    createdAt: string;
  }>;
}

export default function WhatsAppMessages() {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [orders, setOrders] = useState<WhatsAppOrder[]>([]);
  const [activeTab, setActiveTab] = useState<'orders'>('orders');
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [messagesResponse, ordersResponse, inquiriesResponse] = await Promise.all([
        api.get('/orders/whatsapp/pending'),
        api.get('/orders/whatsapp/orders'),
        api.get('/analytics/whatsapp-inquiries')
      ]);
      setMessages(messagesResponse.data as WhatsAppMessage[]);
      setOrders(ordersResponse.data as WhatsAppOrder[]);
      setInquiries(inquiriesResponse.data as any[]);
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Failed to fetch WhatsApp data'
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsProcessed = async (messageId: string, orderId?: number) => {
    try {
      await api.patch(`/orders/whatsapp/${messageId}/processed`, { orderId });
      showToast({
        type: 'success',
        message: 'Message marked as processed'
      });
      fetchData();
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Failed to update message status'
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'CONFIRMED': return 'info';
      case 'PROCESSING': return 'info';
      case 'SHIPPED': return 'info';
      case 'DELIVERED': return 'success';
      case 'CANCELLED': return 'destructive';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">WhatsApp Management</h2>
          <Button onClick={fetchData} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
        
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'orders'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            WhatsApp Orders ({orders.length})
          </button>
        </div>
      </div>

      <div className="divide-y">
        {activeTab === 'orders' && (
          orders.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No WhatsApp orders found
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                      <Badge variant={getStatusBadgeColor(order.status)}>
                        {order.status}
                      </Badge>
                      <Badge variant="info">WhatsApp</Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Customer:</strong> {(order as any).user.name} ({(order as any).user.phone})</p>
                      <p><strong>Total:</strong> {formatCurrency(order.total)}</p>
                      <p><strong>Date:</strong> {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.location.href = `/admin/orders/${order.id}`}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <h4 className="font-medium text-sm mb-2">Items ({order.items.length}):</h4>
                  <div className="space-y-1">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.product.name}{item.variant ? ` (${item.variant.name})` : ''}</span>
                        <span>{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-xs text-gray-500">+{order.items.length - 3} more items</p>
                    )}
                  </div>
                </div>
                
                {order.notes && order.notes.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <h4 className="font-medium text-sm mb-1">Latest Note:</h4>
                    <p className="text-sm text-gray-700">{order.notes[0].note}</p>
                  </div>
                )}
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}
