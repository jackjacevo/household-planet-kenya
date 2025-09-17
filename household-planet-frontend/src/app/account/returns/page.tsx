'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatPrice } from '@/lib/utils';
import { RotateCcw, Plus, Package, Clock, CheckCircle } from 'lucide-react';
import Image from 'next/image';

export default function ReturnsPage() {
  const [returns, setReturns] = useState<any[]>([]);
  const [eligibleOrders, setEligibleOrders] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    reason: '',
    description: '',
    items: [] as string[]
  });

  useEffect(() => {
    fetchReturns();
    fetchEligibleOrders();
  }, []);

  const fetchReturns = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/returns`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReturns(data);
      }
    } catch (error) {
      console.error('Error fetching returns:', error);
    }
  };

  const fetchEligibleOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        setLoading(false);
        return;
      }
      
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/orders/my-orders?status=DELIVERED&returnable=true`;
      console.log('Fetching eligible orders from:', url);
      
      const response = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEligibleOrders(Array.isArray(data) ? data : []);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Failed to fetch eligible orders:', response.status, errorData);
        setEligibleOrders([]);
      }
    } catch (error) {
      console.error('Error fetching eligible orders:', error);
      setEligibleOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/returns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: selectedOrder.id.toString(),
          type: 'RETURN',
          reason: formData.reason,
          preferredResolution: 'REFUND',
          items: formData.items.map(itemId => ({
            orderItemId: itemId,
            quantity: 1,
            reason: formData.reason
          }))
        })
      });

      if (response.ok) {
        await fetchReturns();
        setShowForm(false);
        setSelectedOrder(null);
        setFormData({ reason: '', description: '', items: [] });
        alert('Return request submitted successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to submit return request'}`);
      }
    } catch (error) {
      console.error('Error submitting return:', error);
      alert('Failed to submit return request. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-blue-100 text-blue-800';
      case 'PROCESSING': return 'bg-purple-100 text-purple-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Returns & Exchanges</h1>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Return
          </Button>
        </div>

        {showForm && (
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-medium mb-4">Create Return Request</h3>
            
            {!selectedOrder ? (
              <div>
                <h4 className="font-medium mb-3">Select Order to Return</h4>
                <div className="space-y-3">
                  {Array.isArray(eligibleOrders) && eligibleOrders.map((order: any) => (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="border rounded-lg p-4 cursor-pointer hover:bg-white transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-medium">Order #{order.orderNumber}</h5>
                          <p className="text-sm text-gray-500">
                            Delivered on {new Date(order.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="font-semibold">{formatPrice(order.total)}</span>
                      </div>
                      <div className="flex space-x-2">
                        {order.items?.slice(0, 3).map((item: any) => (
                          <div key={item.id} className="w-12 h-12 relative">
                            <Image
                              src={item.product.images?.[0] || '/placeholder.jpg'}
                              alt={item.product.name}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                        ))}
                        {order.items?.length > 3 && (
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xs">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Selected Order: #{selectedOrder.orderNumber}</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOrder(null)}
                  >
                    Change Order
                  </Button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Return Reason</label>
                  <select
                    value={formData.reason}
                    onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="">Select a reason</option>
                    <option value="DEFECTIVE">Defective/Damaged</option>
                    <option value="WRONG_ITEM">Wrong Item Received</option>
                    <option value="NOT_AS_DESCRIBED">Not as Described</option>
                    <option value="SIZE_ISSUE">Size Issue</option>
                    <option value="CHANGED_MIND">Changed Mind</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Please provide details about the return..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Items to Return</label>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item: any) => (
                      <div key={item.id} className="flex items-center space-x-3 p-2 border rounded">
                        <input
                          type="checkbox"
                          checked={formData.items.includes(item.id.toString())}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({ ...prev, items: [...prev.items, item.id.toString()] }));
                            } else {
                              setFormData(prev => ({ ...prev, items: prev.items.filter(id => id !== item.id.toString()) }));
                            }
                          }}
                        />
                        <div className="w-12 h-12 relative">
                          <Image
                            src={item.product.images?.[0] || '/placeholder.jpg'}
                            alt={item.product.name}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity} • {formatPrice(item.total)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button type="submit" disabled={formData.items.length === 0}>
                    Submit Return Request
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        <div>
          <h2 className="text-lg font-medium mb-4">Your Return Requests</h2>
          
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : returns.length > 0 ? (
            <div className="space-y-4">
              {returns.map((returnItem: any) => (
                <div key={returnItem.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium">Return #{returnItem.id}</h3>
                      <p className="text-sm text-gray-500">
                        Order #{returnItem.order?.orderNumber} • {new Date(returnItem.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Reason: {returnItem.reason}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(returnItem.status)}`}>
                      {returnItem.status}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-700">{returnItem.description}</p>
                  </div>

                  {returnItem.items && returnItem.items.length > 0 && (
                    <div className="flex space-x-2">
                      {returnItem.items.slice(0, 3).map((item: any) => (
                        <div key={item.id} className="w-12 h-12 relative">
                          <Image
                            src={item.orderItem?.product?.images?.[0] || '/placeholder.jpg'}
                            alt={item.orderItem?.product?.name || 'Product'}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      ))}
                      {returnItem.items.length > 3 && (
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xs">
                          +{returnItem.items.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <RotateCcw className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No return requests</h3>
              <p className="text-gray-500 mb-6">You haven't made any return requests yet</p>
              {Array.isArray(eligibleOrders) && eligibleOrders.length > 0 && (
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Return Request
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
