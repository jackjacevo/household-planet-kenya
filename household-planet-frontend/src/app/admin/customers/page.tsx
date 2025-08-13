'use client';

import { useState, useEffect } from 'react';
import { FiEye, FiMail, FiUser, FiSearch, FiFilter, FiTag, FiGift } from 'react-icons/fi';
import Link from 'next/link';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  totalSpent: number;
  loyaltyPoints: number;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  orders: Array<{ id: string; total: number; status: string }>;
  supportTickets: Array<{ id: string; status: string }>;
  tags?: string;
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    isActive: '',
    dateFrom: '',
    dateTo: ''
  });
  const [stats, setStats] = useState<any>({});
  const [selectedSegment, setSelectedSegment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, [filters]);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`http://localhost:3001/api/admin/customers?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCustomers(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/admin/customers/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchSegment = async (segmentType: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/admin/customers/segments/${segmentType}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCustomers(data);
      setSelectedSegment(segmentType);
    } catch (error) {
      console.error('Error fetching segment:', error);
    }
  };

  const addLoyaltyPoints = async (customerId: string, points: number) => {
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
          type: 'BONUS',
          description: 'Admin bonus points'
        })
      });
      fetchCustomers();
    } catch (error) {
      console.error('Error adding loyalty points:', error);
    }
  };

  const getCustomerTags = (customer: Customer) => {
    try {
      return customer.tags ? JSON.parse(customer.tags) : [];
    } catch {
      return [];
    }
  };

  const getCustomerValue = (customer: Customer) => {
    if (customer.totalSpent >= 50000) return 'High Value';
    if (customer.totalSpent >= 20000) return 'Medium Value';
    return 'Low Value';
  };

  const getValueColor = (value: string) => {
    const colors = {
      'High Value': 'bg-green-100 text-green-800',
      'Medium Value': 'bg-yellow-100 text-yellow-800',
      'Low Value': 'bg-gray-100 text-gray-800'
    };
    return colors[value] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600">Manage customer profiles and relationships</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.total || 0}</div>
            <div className="text-sm text-gray-500">Total Customers</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">{stats.active || 0}</div>
            <div className="text-sm text-gray-500">Active</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.newThisMonth || 0}</div>
            <div className="text-sm text-gray-500">New This Month</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-red-600">{stats.inactive || 0}</div>
            <div className="text-sm text-gray-500">Inactive</div>
          </div>
        </div>

        {/* Customer Segments */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Segments</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setSelectedSegment(''); fetchCustomers(); }}
              className={`px-4 py-2 rounded-lg ${selectedSegment === '' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              All Customers
            </button>
            <button
              onClick={() => fetchSegment('high_value')}
              className={`px-4 py-2 rounded-lg ${selectedSegment === 'high_value' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              High Value
            </button>
            <button
              onClick={() => fetchSegment('new_customers')}
              className={`px-4 py-2 rounded-lg ${selectedSegment === 'new_customers' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              New Customers
            </button>
            <button
              onClick={() => fetchSegment('inactive')}
              className={`px-4 py-2 rounded-lg ${selectedSegment === 'inactive' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Inactive
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search customers..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={filters.isActive}
              onChange={(e) => setFilters({...filters, isActive: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCustomers(customers.map(c => c.id));
                        } else {
                          setSelectedCustomers([]);
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Loyalty Points
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Value Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedCustomers.includes(customer.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCustomers([...selectedCustomers, customer.id]);
                          } else {
                            setSelectedCustomers(selectedCustomers.filter(id => id !== customer.id));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <FiUser className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500">{customer.email}</div>
                          {customer.phone && (
                            <div className="text-sm text-gray-500">{customer.phone}</div>
                          )}
                          {getCustomerTags(customer).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {getCustomerTags(customer).map((tag, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>{customer.orders.length} orders</div>
                      {customer.supportTickets.length > 0 && (
                        <div className="text-xs text-orange-600">
                          {customer.supportTickets.length} tickets
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      KSh {customer.totalSpent.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        <span>{customer.loyaltyPoints}</span>
                        <button
                          onClick={() => {
                            const points = prompt('Add loyalty points:');
                            if (points) addLoyaltyPoints(customer.id, parseInt(points));
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          title="Add Points"
                        >
                          <FiGift className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getValueColor(getCustomerValue(customer))}`}>
                        {getCustomerValue(customer)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        customer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {customer.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link href={`/admin/customers/${customer.id}`}>
                          <button className="text-blue-600 hover:text-blue-900">
                            <FiEye className="h-4 w-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => {
                            // Email customer functionality
                            alert('Email functionality would be implemented here');
                          }}
                          className="text-green-600 hover:text-green-900"
                          title="Email Customer"
                        >
                          <FiMail className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            const tag = prompt('Add tag:');
                            if (tag) {
                              // Add tag functionality
                              alert('Tag functionality would be implemented here');
                            }
                          }}
                          className="text-purple-600 hover:text-purple-900"
                          title="Add Tag"
                        >
                          <FiTag className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Spenders */}
        {stats.topSpenders && stats.topSpenders.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Spenders</h3>
            <div className="space-y-3">
              {stats.topSpenders.map((customer, index) => (
                <div key={customer.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{customer.name}</div>
                      <div className="text-sm text-gray-500">{customer.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      KSh {customer.totalSpent.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}