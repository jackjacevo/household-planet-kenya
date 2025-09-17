'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Phone, Calendar, ShoppingBag, MapPin, Tag } from 'lucide-react';
import axios from 'axios';

interface CustomerDetails {
  id: number;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  customerProfile?: {
    totalSpent: number;
    totalOrders: number;
    averageOrderValue: number;
    lastOrderDate?: string;
    tags: Array<{ tag: string }>;
  };
  orders: Array<{
    id: number;
    total: number;
    status: string;
    createdAt: string;
    items: Array<{
      product: { name: string };
      quantity: number;
      price: number;
    }>;
  }>;
  addresses: Array<{
    id: number;
    street: string;
    city: string;
    county: string;
    isDefault: boolean;
  }>;
}

export default function CustomerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchCustomerDetails();
    }
  }, [params.id]);

  const fetchCustomerDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/customers/${params.id}/details`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setCustomer((response as any).data);
    } catch (error) {
      console.error('Error fetching customer details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="bg-white shadow rounded-lg h-96"></div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Customer not found</h3>
          <p className="mt-1 text-sm text-gray-500">The customer you're looking for doesn't exist.</p>
          <button
            onClick={() => router.back()}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Customers
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
        <p className="mt-2 text-sm text-gray-700">Customer details and order history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Customer Info */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Customer Information</h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm text-gray-900">{customer.name}</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-blue-500 mr-3" />
                <span className="text-sm font-medium text-blue-600">{customer.email}</span>
              </div>
              {customer.phone && (
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-900">{customer.phone}</span>
                </div>
              )}
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm text-gray-900">
                  Joined {new Date(customer.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Stats */}
          {customer.customerProfile && (
            <div className="mt-6 bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Statistics</h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    KSh {customer.customerProfile.totalSpent.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Total Spent</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {customer.customerProfile.totalOrders}
                  </div>
                  <div className="text-sm text-gray-500">Total Orders</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    KSh {customer.customerProfile.averageOrderValue.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Average Order Value</div>
                </div>
                {customer.customerProfile.lastOrderDate && (
                  <div>
                    <div className="text-sm text-gray-900">
                      {new Date(customer.customerProfile.lastOrderDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">Last Order</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {customer.customerProfile?.tags && customer.customerProfile.tags.length > 0 && (
            <div className="mt-6 bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Tags</h2>
              </div>
              <div className="px-6 py-4">
                <div className="flex flex-wrap gap-2">
                  {customer.customerProfile.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag.tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Orders and Addresses */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Orders */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <ShoppingBag className="h-5 w-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {customer.orders.length > 0 ? (
                customer.orders.slice(0, 10).map((order) => (
                  <div key={order.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          Order #{order.id}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {order.items.length} items
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          KSh {order.total.toLocaleString()}
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                          order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center">
                  <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No orders</h3>
                  <p className="mt-1 text-sm text-gray-500">This customer hasn't placed any orders yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Addresses */}
          {customer.addresses && customer.addresses.length > 0 && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                  <h2 className="text-lg font-medium text-gray-900">Addresses</h2>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {customer.addresses.map((address) => (
                  <div key={address.id} className="px-6 py-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm text-gray-900">{address.street}</div>
                        <div className="text-sm text-gray-500">
                          {address.city}, {address.county}
                        </div>
                      </div>
                      {address.isDefault && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}