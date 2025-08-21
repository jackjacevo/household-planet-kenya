'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/useToast';
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

export default function WhatsAppMessages() {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await api.get('/api/orders/whatsapp/pending');
      setMessages(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch WhatsApp messages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsProcessed = async (messageId: string, orderId?: number) => {
    try {
      await api.patch(`/api/orders/whatsapp/${messageId}/processed`, { orderId });
      toast({
        title: 'Success',
        description: 'Message marked as processed',
        variant: 'success',
      });
      fetchMessages();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update message status',
        variant: 'destructive',
      });
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
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Pending WhatsApp Messages</h2>
          <Button onClick={fetchMessages} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
      </div>

      <div className="divide-y">
        {messages.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No pending WhatsApp messages
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{message.phoneNumber}</span>
                    {message.isOrderCandidate && (
                      <Badge variant="warning">Potential Order</Badge>
                    )}
                    {message.processed && (
                      <Badge variant="success">Processed</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                  </p>
                </div>
                
                {!message.processed && (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markAsProcessed(message.messageId || message.id.toString())}
                    >
                      Mark as Processed
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        // Open WhatsApp order form with pre-filled data
                        const orderDetails = message.message;
                        const phone = message.phoneNumber;
                        // You could open a modal or navigate to order form
                        console.log('Create order for:', { phone, orderDetails });
                      }}
                    >
                      Create Order
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm whitespace-pre-wrap">{message.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}