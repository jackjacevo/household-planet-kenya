'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FiUser, FiMail, FiPhone, FiMapPin, FiShoppingBag, FiGift, FiMessageSquare, FiEdit, FiTag } from 'react-icons/fi';

interface CustomerDetails {
  id: string;
  name: string;
  email: string;
  phone?: string;
  totalSpent: number;
  loyaltyPoints: number;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  orders: Array<{
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    createdAt: string;
    items: Array<{ product: { name: string }; quantity: number }>;
  }>;
  addresses: Array<{
    id: string;
    type: string;
    fullName: string;
    phone: string;
    county: string;
    town: string;
    street: string;
    isDefault: boolean;
  }>;
  supportTickets: Array<{
    id: string;
    subject: string;
    status: string;
    priority: string;
    createdAt: string;
    replies: Array<{ message: string; isStaff: boolean; createdAt: string }>;
  }>;
  loyaltyTransactions: Array<{
    id: string;
    points: number;
    type: string;
    description: string;
    createdAt: string;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment?: string;
    product: { name: string };
    createdAt: string;
  }>;
  tags?: string;
}

export default function CustomerDetails() {
  const params = useParams();
  const customerId = params.id as string;
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [insights, setInsights] = useState<any>(null);
  const [communicationLog, setCommunicationLog] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [newTag, setNewTag] = useState('');
  const [newTicket, setNewTicket] = useState({
    subject: '',
    message: '',
    category: 'GENERAL',
    priority: 'MEDIUM'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (customerId) {
      fetchCustomer();
      fetchInsights();
      fetchCommunicationLog();
    }
  }, [customerId]);

  const fetchCustomer = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/admin/customers/${customerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCustomer(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching customer:', error);
      setLoading(false);
    }
  };

  const fetchInsights = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/admin/customers/${customerId}/insights`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setInsights(data);
    } catch (error) {
      console.error('Error fetching insights:', error);
    }
  };

  const fetchCommunicationLog = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/admin/customers/${customerId}/communication-log`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCommunicationLog(data);
    } catch (error) {
      console.error('Error fetching communication log:', error);
    }
  };

  const addTag = async () => {
    if (!newTag.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3001/api/admin/customers/${customerId}/tags`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tag: newTag })
      });
      setNewTag('');
      fetchCustomer();
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  const addLoyaltyPoints = async (points: number, description: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3001/api/admin/customers/${customerId}/loyalty`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          points,
          type: points > 0 ? 'BONUS' : 'REDEEMED',
          description
        })
      });
      fetchCustomer();
      fetchInsights();
    } catch (error) {
      console.error('Error managing loyalty points:', error);
    }
  };

  const createSupportTicket = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3001/api/admin/customers/${customerId}/support-tickets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTicket)
      });
      setNewTicket({ subject: '', message: '', category: 'GENERAL', priority: 'MEDIUM' });
      fetchCustomer();
    } catch (error) {
      console.error('Error creating support ticket:', error);
    }
  };

  const verifyAddress = async (addressId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/admin/customers/${customerId}/addresses/${addressId}/verify`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      alert(result.isValid ? 'Address is valid' : 'Address needs verification: ' + result.suggestions.join(', '));
    } catch (error) {
      console.error('Error verifying address:', error);
    }
  };

  const getCustomerTags = () => {
    try {
      return customer?.tags ? JSON.parse(customer.tags) : [];
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Customer not found</h2>
          <p className="text-gray-600">The requested customer could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <FiUser className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
              <p className="text-gray-600">{customer.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  customer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {customer.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="text-sm text-gray-500">
                  Joined {new Date(customer.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FiShoppingBag className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{customer.orders.length}</p>
                <p className="text-sm text-gray-500">Total Orders</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-2xl">💰</div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">KSh {customer.totalSpent.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Total Spent</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FiGift className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{customer.loyaltyPoints}</p>
                <p className="text-sm text-gray-500">Loyalty Points</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FiMessageSquare className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{customer.supportTickets.length}</p>
                <p className="text-sm text-gray-500">Support Tickets</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'orders', name: 'Orders' },
              { id: 'addresses', name: 'Addresses' },
              { id: 'support', name: 'Support' },
              { id: 'loyalty', name: 'Loyalty' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Overview Tab */}
            {activeTab === 'overview' && insights && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Insights</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Average Order Value</p>
                      <p className="text-lg font-medium">KSh {insights.avgOrderValue.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Days Since Last Order</p>
                      <p className="text-lg font-medium">{insights.daysSinceLastOrder || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Reviews Written</p>
                      <p className="text-lg font-medium">{insights.reviews}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Addresses</p>
                      <p className="text-lg font-medium">{insights.addresses}</p>
                    </div>
                  </div>
                </div>

                {insights.favoriteProducts.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Favorite Products</h3>
                    <div className="space-y-2">
                      {insights.favoriteProducts.map((product, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="text-gray-900">{product.name}</span>
                          <span className="text-gray-500">{product.quantity} purchased</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Order History</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {customer.orders.map((order) => (
                    <div key={order.id} className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">KSh {order.total.toLocaleString()}</p>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                            order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Addresses</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {customer.addresses.map((address) => (
                    <div key={address.id} className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-900">{address.type}</p>
                            {address.isDefault && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{address.fullName}</p>
                          <p className="text-sm text-gray-600">{address.phone}</p>
                          <p className="text-sm text-gray-600">
                            {address.street}, {address.town}, {address.county}
                          </p>
                        </div>
                        <button
                          onClick={() => verifyAddress(address.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Verify
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Support Tab */}
            {activeTab === 'support' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Support Ticket</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Subject"
                      value={newTicket.subject}
                      onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      placeholder="Message"
                      rows={4}
                      value={newTicket.message}
                      onChange={(e) => setNewTicket({...newTicket, message: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex space-x-4">
                      <select
                        value={newTicket.category}
                        onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="GENERAL">General</option>
                        <option value="ORDER">Order</option>
                        <option value="PRODUCT">Product</option>
                        <option value="PAYMENT">Payment</option>
                        <option value="DELIVERY">Delivery</option>
                      </select>
                      <select
                        value={newTicket.priority}
                        onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </div>
                    <button
                      onClick={createSupportTicket}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Create Ticket
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Support Tickets</h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {customer.supportTickets.map((ticket) => (
                      <div key={ticket.id} className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{ticket.subject}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(ticket.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-500">{ticket.replies.length} replies</p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              ticket.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                              ticket.status === 'CLOSED' ? 'bg-gray-100 text-gray-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {ticket.status}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">{ticket.priority}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Loyalty Tab */}
            {activeTab === 'loyalty' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage Loyalty Points</h3>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => {
                        const points = prompt('Add points:');
                        if (points) addLoyaltyPoints(parseInt(points), 'Admin bonus points');
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      Add Points
                    </button>
                    <button
                      onClick={() => {
                        const points = prompt('Deduct points:');
                        if (points) addLoyaltyPoints(-parseInt(points), 'Admin adjustment');
                      }}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                      Deduct Points
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Loyalty Transactions</h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {customer.loyaltyTransactions.map((transaction) => (
                      <div key={transaction.id} className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{transaction.description}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`font-medium ${
                              transaction.points > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.points > 0 ? '+' : ''}{transaction.points}
                            </p>
                            <p className="text-xs text-gray-500">{transaction.type}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Tags */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Tags</h3>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {getCustomerTags().map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Add tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={addTag}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <FiTag className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Communication Log */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Communications</h3>
              <div className="space-y-3">
                {communicationLog.slice(0, 5).map((comm, index) => (
                  <div key={index} className="text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-900">{comm.type}</span>
                      <span className="text-gray-500">
                        {new Date(comm.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600">{comm.subject}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}