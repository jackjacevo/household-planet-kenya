'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Tag, MessageSquare, Star, User, Mail, Phone, MapPin } from 'lucide-react';

interface Customer {
  id: number;
  email: string;
  name: string;
  phone: string;
  createdAt: string;
  customerProfile?: {
    loyaltyPoints: number;
    totalSpent: number;
    totalOrders: number;
    tags: Array<{ tag: string }>;
  };
  orders: Array<{
    id: number;
    total: number;
    status: string;
    createdAt: string;
  }>;
}

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showTagModal, setShowTagModal] = useState(false);
  const [showCommunicationModal, setShowCommunicationModal] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [communicationData, setCommunicationData] = useState({
    type: 'EMAIL' as const,
    subject: '',
    message: '',
    channel: 'system',
  });

  useEffect(() => {
    if (searchQuery) {
      searchCustomers();
    }
  }, [searchQuery]);

  const searchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customers/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Error searching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTag = async () => {
    if (!selectedCustomer?.customerProfile || !newTag.trim()) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customers/${selectedCustomer.id}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ tag: newTag.trim() }),
      });

      if (response.ok) {
        setNewTag('');
        setShowTagModal(false);
        searchCustomers(); // Refresh data
      }
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  const removeTag = async (tag: string) => {
    if (!selectedCustomer?.customerProfile) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customers/${selectedCustomer.id}/tags/${encodeURIComponent(tag)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        searchCustomers(); // Refresh data
      }
    } catch (error) {
      console.error('Error removing tag:', error);
    }
  };

  const sendCommunication = async () => {
    if (!selectedCustomer?.customerProfile) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customers/${selectedCustomer.id}/communications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(communicationData),
      });

      if (response.ok) {
        setCommunicationData({
          type: 'EMAIL',
          subject: '',
          message: '',
          channel: 'system',
        });
        setShowCommunicationModal(false);
      }
    } catch (error) {
      console.error('Error sending communication:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search customers by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Customers</h2>
        </div>

        {loading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-6 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchQuery ? 'No customers found' : 'Search for customers to get started'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {customers.map((customer) => (
              <div key={customer.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{customer.name}</h3>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center text-blue-600 font-medium">
                          <Mail className="w-4 h-4 mr-1 text-blue-500" />
                          {customer.email}
                        </div>
                        {customer.phone && (
                          <div className="flex items-center text-gray-500">
                            <Phone className="w-4 h-4 mr-1" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {customer.customerProfile && (
                      <div className="text-right text-sm">
                        <div className="flex items-center text-yellow-600">
                          <Star className="w-4 h-4 mr-1" />
                          {customer.customerProfile.loyaltyPoints} points
                        </div>
                        <div className="text-gray-500">
                          {customer.customerProfile.totalOrders} orders • KSh {customer.customerProfile.totalSpent}
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setShowTagModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600"
                        title="Manage Tags"
                      >
                        <Tag className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setShowCommunicationModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-green-600"
                        title="Send Communication"
                      >
                        <MessageSquare className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Customer Tags */}
                {customer.customerProfile?.tags && customer.customerProfile.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {customer.customerProfile.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag.tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Recent Orders */}
                {customer.orders.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Orders</h4>
                    <div className="flex space-x-4">
                      {customer.orders.slice(0, 3).map((order) => (
                        <div key={order.id} className="text-xs bg-gray-100 rounded px-2 py-1">
                          #{order.id} - KSh {order.total} - {order.status}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tag Management Modal */}
      {showTagModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Manage Tags for {selectedCustomer.name}
            </h3>

            {/* Current Tags */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Current Tags</h4>
              <div className="flex flex-wrap gap-2">
                {selectedCustomer.customerProfile?.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tag.tag}
                    <button
                      onClick={() => removeTag(tag.tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                )) || <p className="text-gray-500 text-sm">No tags assigned</p>}
              </div>
            </div>

            {/* Add New Tag */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add New Tag
              </label>
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter tag name"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowTagModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={addTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Tag
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Communication Modal */}
      {showCommunicationModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Send Communication to {selectedCustomer.name}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Communication Type
                </label>
                <select
                  value={communicationData.type}
                  onChange={(e) => setCommunicationData({
                    ...communicationData,
                    type: e.target.value as any,
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="EMAIL">Email</option>
                  <option value="SMS">SMS</option>
                  <option value="IN_APP">In-App Message</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={communicationData.subject}
                  onChange={(e) => setCommunicationData({
                    ...communicationData,
                    subject: e.target.value,
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter subject"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={communicationData.message}
                  onChange={(e) => setCommunicationData({
                    ...communicationData,
                    message: e.target.value,
                  })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your message"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCommunicationModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={sendCommunication}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
