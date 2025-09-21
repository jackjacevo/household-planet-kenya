'use client';

import { useState, useEffect } from 'react';
import { Users, Search, Trash2, Eye, CheckSquare, Square, X, User, Mail, Phone, Calendar, ShoppingBag, MapPin, Tag, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface Customer {
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
      product: { name: string; images?: string };
      quantity: number;
      price: number;
    }>;
  }>;
  addresses?: Array<{
    id: number;
    street: string;
    city: string;
    county: string;
    isDefault: boolean;
  }>;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ type: 'single' | 'bulk'; customer?: Customer; customers?: Customer[] } | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, [searchQuery]);



  // Test notification on component mount
  useEffect(() => {
    console.log('Component mounted, notification state:', notification);
  }, [notification]);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/customers/search?q=${encodeURIComponent(searchQuery)}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      // Handle different response structures
      const responseData = (response as any).data;
      if (responseData.customers && Array.isArray(responseData.customers)) {
        setCustomers(responseData.customers);
      } else if (responseData.data && Array.isArray(responseData.data)) {
        setCustomers(responseData.data);
      } else if (Array.isArray(responseData)) {
        setCustomers(responseData);
      } else {
        console.warn('Unexpected customers API response structure:', responseData);
        setCustomers([]);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCustomer = (customerId: number) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customers.map(c => c.id));
    }
  };

  const handleDeleteCustomer = async (customerId: number) => {
    const customer = customers.find(c => c.id === customerId);
    setConfirmDialog({ type: 'single', customer });
  };

  const confirmDeleteCustomer = async (customerId: number) => {
    const customer = customers.find(c => c.id === customerId);
    setConfirmDialog(null);

    try {
      setDeleting(true);
      const token = localStorage.getItem('token');
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/customers/${customerId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setCustomers(prev => prev.filter(c => c.id !== customerId));
      setSelectedCustomers(prev => prev.filter(id => id !== customerId));
      
      setNotification({
        type: 'success',
        message: `Customer "${customer?.name || 'Unknown'}" has been successfully deleted.`
      });
      setTimeout(() => setNotification(null), 5000);
    } catch (error) {
      console.error('Error deleting customer:', error);
      setNotification({
        type: 'error',
        message: `Failed to delete customer "${customer?.name || 'Unknown'}". Please try again.`
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCustomers.length === 0) return;
    
    const selectedCustomerObjects = customers.filter(c => selectedCustomers.includes(c.id));
    setConfirmDialog({ type: 'bulk', customers: selectedCustomerObjects });
  };

  const confirmBulkDelete = async () => {
    setConfirmDialog(null);

    try {
      setDeleting(true);
      const token = localStorage.getItem('token');
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/customers/bulk`,
        { 
          headers: { 'Authorization': `Bearer ${token}` },
          data: { customerIds: selectedCustomers }
        }
      );
      
      setCustomers(prev => prev.filter(c => !selectedCustomers.includes(c.id)));
      setSelectedCustomers([]);
      
      setNotification({
        type: 'success',
        message: `Successfully deleted ${selectedCustomers.length} customers.`
      });
      setTimeout(() => setNotification(null), 5000);
    } catch (error) {
      console.error('Error bulk deleting customers:', error);
      setNotification({
        type: 'error',
        message: `Failed to delete ${selectedCustomers.length} customers. Please try again.`
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setDeleting(false);
    }
  };

  const handleViewCustomer = async (customerId: number) => {
    try {
      setLoadingDetails(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/customers/${customerId}/details`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      // Handle different response structures
      const responseData = (response as any).data;
      if (responseData.customer) {
        setSelectedCustomer(responseData.customer);
      } else if (responseData.data) {
        setSelectedCustomer(responseData.data);
      } else {
        setSelectedCustomer(responseData);
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
      alert('Failed to load customer details');
    } finally {
      setLoadingDetails(false);
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

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your customers, view their details, and perform bulk actions.
            {customers.length > 0 && (
              <span className="block mt-1">
                Showing {customers.length} customers
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search customers by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        
        {selectedCustomers.length > 0 && (
          <button
            onClick={handleBulkDelete}
            disabled={deleting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected ({selectedCustomers.length})
          </button>
        )}
        

      </div>

      {/* Customer Table */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="relative w-12 px-6 sm:w-16 sm:px-8">
                      <button
                        onClick={handleSelectAll}
                        className="absolute inset-y-0 left-0 w-full h-full flex items-center justify-center"
                      >
                        {selectedCustomers.length === customers.length && customers.length > 0 ? (
                          <CheckSquare className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Square className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Spent
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customers.map((customer) => (
                    <tr key={customer.id} className={selectedCustomers.includes(customer.id) ? 'bg-blue-50' : ''}>
                      <td className="relative w-12 px-6 sm:w-16 sm:px-8">
                        <button
                          onClick={() => handleSelectCustomer(customer.id)}
                          className="absolute inset-y-0 left-0 w-full h-full flex items-center justify-center"
                        >
                          {selectedCustomers.includes(customer.id) ? (
                            <CheckSquare className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Square className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              customer.email.endsWith('@whatsapp.temp') 
                                ? 'bg-green-100' 
                                : 'bg-gray-300'
                            }`}>
                              <Users className={`h-5 w-5 ${
                                customer.email.endsWith('@whatsapp.temp') 
                                  ? 'text-green-600' 
                                  : 'text-gray-600'
                              }`} />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                              {customer.email.endsWith('@whatsapp.temp') && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                  WhatsApp
                                </span>
                              )}
                            </div>
                            <div className="text-sm font-medium text-blue-600">{customer.email}</div>
                            {customer.phone && (
                              <div className="text-sm text-gray-500">{customer.phone}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.customerProfile?.totalOrders || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        KSh {(customer.customerProfile?.totalSpent || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewCustomer(customer.id)}
                            disabled={loadingDetails}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCustomer(customer.id)}
                            disabled={deleting}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {customers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery ? 'Try adjusting your search terms.' : 'No customers have registered yet.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedCustomer(null)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{selectedCustomer.name}</h3>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Customer Info */}
                  <div className="lg:col-span-1">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Customer Information</h4>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{selectedCustomer.name}</span>
                        </div>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-blue-500 mr-2" />
                          <span className="text-sm font-medium text-blue-600">{selectedCustomer.email}</span>
                        </div>
                        {selectedCustomer.phone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">{selectedCustomer.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            Joined {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Customer Stats */}
                    {selectedCustomer.customerProfile && (
                      <div className="mt-4 bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Statistics</h4>
                        <div className="space-y-3">
                          <div>
                            <div className="text-lg font-bold text-gray-900">
                              KSh {selectedCustomer.customerProfile.totalSpent.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">Total Spent</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-gray-900">
                              {selectedCustomer.customerProfile.totalOrders}
                            </div>
                            <div className="text-xs text-gray-500">Total Orders</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-gray-900">
                              KSh {selectedCustomer.customerProfile.averageOrderValue.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">Average Order Value</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {selectedCustomer.customerProfile?.tags && selectedCustomer.customerProfile.tags.length > 0 && (
                      <div className="mt-4 bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Tags</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedCustomer.customerProfile.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              <Tag className="h-3 w-3 mr-1" />
                              {tag.tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Orders */}
                  <div className="lg:col-span-2">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <ShoppingBag className="h-4 w-4 text-gray-400 mr-2" />
                        <h4 className="text-sm font-medium text-gray-900">Recent Orders</h4>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {selectedCustomer.orders && selectedCustomer.orders.length > 0 ? (
                          <div className="space-y-3">
                            {selectedCustomer.orders.slice(0, 5).map((order) => (
                              <div key={order.id} className="bg-white rounded p-3 border">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      Order #{order.id}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {new Date(order.createdAt).toLocaleDateString()}
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
                                
                                {/* Order Items */}
                                {order.items && order.items.length > 0 ? (
                                  <div className="space-y-2">
                                    {order.items.map((item, index) => (
                                      <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                                        <img
                                          src={item.product.images ? JSON.parse(item.product.images)[0] : '/images/placeholder.jpg'}
                                          alt={item.product.name}
                                          className="w-10 h-10 object-cover rounded"
                                          onError={(e) => {
                                            e.currentTarget.src = '/images/placeholder.jpg';
                                          }}
                                        />
                                        <div className="flex-1">
                                          <div className="text-xs font-medium text-gray-900">{item.product.name}</div>
                                          <div className="text-xs text-gray-500">Qty: {item.quantity} × KSh {item.price.toLocaleString()}</div>
                                        </div>
                                        <div className="text-xs font-medium text-gray-900">
                                          KSh {(item.quantity * item.price).toLocaleString()}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-xs text-gray-400 bg-orange-50 p-2 rounded">
                                    No items found - Order total: KSh {order.total.toLocaleString()}
                                    <br />
                                    <span className="text-orange-600">This may be a WhatsApp order with missing item details</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <ShoppingBag className="mx-auto h-8 w-8 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-500">No orders found</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Addresses */}
                    {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 && (
                      <div className="mt-4 bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          <h4 className="text-sm font-medium text-gray-900">Addresses</h4>
                        </div>
                        <div className="space-y-2">
                          {selectedCustomer.addresses.map((address) => (
                            <div key={address.id} className="bg-white rounded p-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="text-sm text-gray-900">{address.street}</div>
                                  <div className="text-xs text-gray-500">
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

                    {/* Wishlist & Cart Info */}
                    <div className="mt-4 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <h4 className="text-sm font-medium text-yellow-800 mb-2">Wishlist & Cart Data</h4>
                      <p className="text-xs text-yellow-700 mb-2">These are stored in user's browser and not synced to backend:</p>
                      <ul className="text-xs text-yellow-700 ml-4 list-disc">
                        <li>User can view in their account dashboard</li>
                        <li>Admin cannot access this data remotely</li>
                        <li>Data persists only on user's device</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div 
          className="fixed top-4 right-4 z-50 w-96 max-w-sm"
          style={{ zIndex: 9999 }}
        >
          <div className={`rounded-lg p-4 shadow-xl border ${
            notification.type === 'success' 
              ? 'bg-green-100 border-green-500 text-green-900' 
              : 'bg-red-100 border-red-500 text-red-900'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-bold">
                  {notification.type === 'success' ? 'Success!' : 'Error!'}
                </p>
                <p className="text-sm mt-1">{notification.message}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setNotification(null)}
                  className="inline-flex text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setConfirmDialog(null)} />
          
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="ml-3 text-lg font-medium text-gray-900">
                  {confirmDialog.type === 'single' ? 'Delete Customer' : 'Delete Customers'}
                </h3>
              </div>
              
              <div className="mb-6">
                {confirmDialog.type === 'single' ? (
                  <p className="text-sm text-gray-600">
                    Delete <strong>{confirmDialog.customer?.name}</strong>? This cannot be undone.
                  </p>
                ) : (
                  <div className="text-sm text-gray-600">
                    <p className="mb-2">Delete <strong>{confirmDialog.customers?.length} customers</strong>? This cannot be undone.</p>
                    <div className="max-h-24 overflow-y-auto bg-gray-50 p-2 rounded text-xs">
                      {confirmDialog.customers?.map(customer => (
                        <div key={customer.id}>• {customer.name}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setConfirmDialog(null)}
                  disabled={deleting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (confirmDialog.type === 'single' && confirmDialog.customer) {
                      confirmDeleteCustomer(confirmDialog.customer.id);
                    } else {
                      confirmBulkDelete();
                    }
                  }}
                  disabled={deleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
