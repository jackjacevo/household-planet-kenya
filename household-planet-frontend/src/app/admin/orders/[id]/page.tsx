'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FiPackage, FiTruck, FiMail, FiPrinter, FiEdit, FiCheck, FiX } from 'react-icons/fi';

interface OrderDetails {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  subtotal: number;
  shippingCost: number;
  discount: number;
  createdAt: string;
  shippingAddress: string;
  deliveryLocation: string;
  user?: { name: string; email: string; phone: string };
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    total: number;
    product: { name: string; images?: string };
    variant?: { name: string };
  }>;
  payments: Array<{
    id: string;
    amount: number;
    status: string;
    paymentMethod: string;
    createdAt: string;
  }>;
  deliveryTracking?: {
    status: string;
    location?: string;
    notes?: string;
    updates: Array<{
      status: string;
      location?: string;
      notes?: string;
      timestamp: string;
    }>;
  };
  statusHistory: Array<{
    status: string;
    notes?: string;
    createdAt: string;
  }>;
  returnRequests: Array<{
    id: string;
    reason: string;
    status: string;
    createdAt: string;
  }>;
}

export default function OrderDetails() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [newNote, setNewNote] = useState('');
  const [emailTemplate, setEmailTemplate] = useState('order_confirmed');
  const [customMessage, setCustomMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/admin/orders/${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setOrder(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching order:', error);
      setLoading(false);
    }
  };

  const updateOrderStatus = async (status: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3001/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      fetchOrder();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const verifyPayment = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/admin/orders/${orderId}/verify-payment`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.verified) {
        fetchOrder();
        alert('Payment verified successfully!');
      } else {
        alert('Payment verification failed or payment not found.');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
    }
  };

  const generateShippingLabel = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/admin/orders/${orderId}/shipping-label`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const labelData = await response.json();
      
      // In a real implementation, this would generate a PDF or print label
      console.log('Shipping label data:', labelData);
      alert(`Shipping label generated! Tracking: ${labelData.trackingNumber}`);
      fetchOrder();
    } catch (error) {
      console.error('Error generating shipping label:', error);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3001/api/admin/orders/${orderId}/notes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes: newNote })
      });
      setNewNote('');
      fetchOrder();
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const sendEmail = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3001/api/admin/orders/${orderId}/email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          template: emailTemplate,
          customMessage: emailTemplate === 'custom' ? customMessage : undefined
        })
      });
      alert('Email sent successfully!');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const processReturn = async (returnId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3001/api/admin/orders/returns/${returnId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      fetchOrder();
    } catch (error) {
      console.error('Error processing return:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Order not found</h2>
          <p className="text-gray-600">The requested order could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
              <p className="text-gray-600">Order details and management</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={generateShippingLabel}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
              >
                <FiPrinter className="h-4 w-4" />
                <span>Shipping Label</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 border-b border-gray-200 pb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <FiPackage className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                      {item.variant && (
                        <p className="text-sm text-gray-500">Variant: {item.variant.name}</p>
                      )}
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity} × KSh {item.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        KSh {item.total.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-gray-200 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-gray-900">KSh {order.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="text-gray-900">KSh {order.shippingCost.toLocaleString()}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount:</span>
                      <span className="text-green-600">-KSh {order.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
                    <span>Total:</span>
                    <span>KSh {order.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Tracking */}
            {order.deliveryTracking && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Delivery Tracking</h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <FiTruck className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Status: {order.deliveryTracking.status}</p>
                      {order.deliveryTracking.location && (
                        <p className="text-sm text-gray-500">Location: {order.deliveryTracking.location}</p>
                      )}
                    </div>
                  </div>

                  {order.deliveryTracking.updates.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-medium text-gray-900 mb-2">Tracking Updates</h3>
                      <div className="space-y-2">
                        {order.deliveryTracking.updates.map((update, index) => (
                          <div key={index} className="text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-900">{update.status}</span>
                              <span className="text-gray-500">
                                {new Date(update.timestamp).toLocaleString()}
                              </span>
                            </div>
                            {update.location && (
                              <p className="text-gray-500">Location: {update.location}</p>
                            )}
                            {update.notes && (
                              <p className="text-gray-500">{update.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Return Requests */}
            {order.returnRequests.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Return Requests</h2>
                <div className="space-y-4">
                  {order.returnRequests.map((returnReq) => (
                    <div key={returnReq.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">Reason: {returnReq.reason}</p>
                          <p className="text-sm text-gray-500">
                            Status: {returnReq.status} | {new Date(returnReq.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {returnReq.status === 'PENDING' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => processReturn(returnReq.id, 'APPROVED')}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => processReturn(returnReq.id, 'REJECTED')}
                              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Status</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Current Status</p>
                  <p className="text-lg font-medium text-gray-900">{order.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Status</p>
                  <p className="text-lg font-medium text-gray-900">{order.paymentStatus}</p>
                </div>
                
                <div className="space-y-2">
                  {order.status === 'PENDING' && (
                    <button
                      onClick={() => updateOrderStatus('CONFIRMED')}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Confirm Order
                    </button>
                  )}
                  {order.status === 'CONFIRMED' && (
                    <button
                      onClick={() => updateOrderStatus('PROCESSING')}
                      className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                    >
                      Start Processing
                    </button>
                  )}
                  {order.status === 'PROCESSING' && (
                    <button
                      onClick={() => updateOrderStatus('SHIPPED')}
                      className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                    >
                      Mark as Shipped
                    </button>
                  )}
                  {order.status === 'SHIPPED' && (
                    <button
                      onClick={() => updateOrderStatus('DELIVERED')}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      Mark as Delivered
                    </button>
                  )}
                  
                  {order.paymentStatus === 'PENDING' && (
                    <button
                      onClick={verifyPayment}
                      className="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
                    >
                      Verify Payment
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="text-gray-900">{order.user?.name || order.guestName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-gray-900">{order.user?.email || order.guestEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="text-gray-900">{order.user?.phone || order.guestPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Shipping Address</p>
                  <p className="text-gray-900">{order.shippingAddress}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Delivery Location</p>
                  <p className="text-gray-900">{order.deliveryLocation}</p>
                </div>
              </div>
            </div>

            {/* Customer Communication */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Send Email</h2>
              <div className="space-y-4">
                <select
                  value={emailTemplate}
                  onChange={(e) => setEmailTemplate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="order_confirmed">Order Confirmed</option>
                  <option value="order_shipped">Order Shipped</option>
                  <option value="order_delivered">Order Delivered</option>
                  <option value="custom">Custom Message</option>
                </select>
                
                {emailTemplate === 'custom' && (
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Enter custom message..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                )}
                
                <button
                  onClick={sendEmail}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-700"
                >
                  <FiMail className="h-4 w-4" />
                  <span>Send Email</span>
                </button>
              </div>
            </div>

            {/* Order Notes */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Notes</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add internal note..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={addNote}
                    className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                  >
                    Add Note
                  </button>
                </div>

                <div className="space-y-2">
                  {order.statusHistory.map((history, index) => (
                    <div key={index} className="text-sm border-l-2 border-gray-200 pl-3">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900">{history.status}</span>
                        <span className="text-gray-500">
                          {new Date(history.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {history.notes && (
                        <p className="text-gray-600 mt-1">{history.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}