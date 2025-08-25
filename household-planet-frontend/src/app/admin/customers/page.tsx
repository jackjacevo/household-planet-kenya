'use client';

import { useState, useEffect } from 'react';
import { Users, UserPlus, Activity, MapPin, Crown } from 'lucide-react';
import axios from 'axios';

interface CustomerInsights {
  newCustomers: number;
  activeCustomers: number;
  topCustomers: Array<{
    id: number;
    name: string;
    email: string;
    _count: { orders: number };
    totalSpent: number;
  }>;
  customersByCounty: Array<{
    county: string;
    customers: number;
  }>;
}

export default function CustomersPage() {
  const [insights, setInsights] = useState<CustomerInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerInsights();
  }, []);

  const fetchCustomerInsights = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/customers/insights`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setInsights(response.data);
    } catch (error) {
      console.error('Error fetching customer insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white overflow-hidden shadow rounded-lg h-24" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!insights) return <div>Error loading customer insights</div>;

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Customer Insights</h1>
        <p className="mt-2 text-sm text-gray-700">
          Understand your customer base and identify growth opportunities.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserPlus className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    New Customers (30 days)
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {insights.newCustomers}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Customers (30 days)
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {insights.activeCustomers}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Customers
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {insights.customersByCounty.reduce((sum, county) => sum + county.customers, 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Customers */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Crown className="h-5 w-5 text-yellow-600 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Top Customers</h2>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {insights.topCustomers.map((customer, index) => (
              <div key={customer.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          #{index + 1}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        {customer.name}
                      </p>
                      <p className="text-sm text-gray-500">{customer.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      KSh {customer.totalSpent.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {customer._count.orders} orders
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customers by County */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Customers by County</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {insights.customersByCounty.map((county, index) => {
                const maxCustomers = Math.max(...insights.customersByCounty.map(c => c.customers));
                return (
                  <div key={index} className="flex items-center">
                    <div className="w-24 text-sm text-gray-600">
                      {county.county}
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-blue-600 h-4 rounded-full"
                          style={{
                            width: `${(county.customers / maxCustomers) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                    <div className="w-16 text-sm font-medium text-gray-900 text-right">
                      {county.customers}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Behavior Analysis */}
      <div className="mt-8 bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Customer Behavior Analysis</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {insights.activeCustomers > 0 ? 
                  ((insights.activeCustomers / insights.customersByCounty.reduce((sum, county) => sum + county.customers, 0)) * 100).toFixed(1) 
                  : 0}%
              </div>
              <div className="text-sm text-gray-500 mt-1">Customer Retention Rate</div>
              <div className="text-xs text-gray-400 mt-1">Active in last 30 days</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {insights.topCustomers.length > 0 ? 
                  (insights.topCustomers.reduce((sum, customer) => sum + customer.totalSpent, 0) / insights.topCustomers.length).toLocaleString()
                  : 0}
              </div>
              <div className="text-sm text-gray-500 mt-1">Avg Customer Value</div>
              <div className="text-xs text-gray-400 mt-1">KSh per top customer</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {insights.topCustomers.length > 0 ? 
                  (insights.topCustomers.reduce((sum, customer) => sum + customer._count.orders, 0) / insights.topCustomers.length).toFixed(1)
                  : 0}
              </div>
              <div className="text-sm text-gray-500 mt-1">Avg Orders per Customer</div>
              <div className="text-xs text-gray-400 mt-1">Among top customers</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}