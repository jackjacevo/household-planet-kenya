'use client';

// Updated to use proper delivery admin endpoint
import { useState, useEffect } from 'react';
import { Truck, MapPin, Clock, CheckCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import axios from 'axios';

interface DeliveryOrder {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  status: string;
  estimatedDelivery: string;
  trackingNumber: string | null;
  total: number;
}

export default function AdminDeliveryPage() {
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `/api/delivery/admin/orders`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      const deliveries = (response as any).data.data || (response as any).data;
      setDeliveries(deliveries);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      // Fallback to orders endpoint if delivery endpoint fails
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `/api/orders`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        const orders = (response as any).data.orders || (response as any).data;
        const mappedDeliveries = orders.map((order: any) => {
          let address = order.deliveryLocation || 'N/A';
          if (!address || address === 'N/A') {
            if (order.shippingAddress) {
              try {
                const parsed = JSON.parse(order.shippingAddress);
                const parts = [parsed.street, parsed.town, parsed.county].filter(Boolean);
                address = parts.length > 0 ? parts.join(', ') : order.shippingAddress;
              } catch {
                address = order.shippingAddress;
              }
            }
          }
          
          return {
            id: order.id,
            orderNumber: order.orderNumber,
            customerName: (order as any).user?.name || order.customerName || 'Unknown',
            customerPhone: (order as any).user?.phone || order.customerPhone || 'N/A',
            shippingAddress: address,
            status: order.status,
            estimatedDelivery: order.estimatedDelivery || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            trackingNumber: order.trackingNumber || order.delivery?.trackingNumber || null,
            total: order.total || 0
          };
        });
        setDeliveries(mappedDeliveries);
      } catch (fallbackError) {
        console.error('Error fetching from fallback endpoint:', fallbackError);
        setDeliveries([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateDeliveryStatus = async (deliveryId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/orders/${deliveryId}/status`,
        { status: newStatus },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      fetchDeliveries();
    } catch (error) {
      console.error('Error updating delivery status:', error);
      alert('Failed to update delivery status');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'IN_TRANSIT': return <Truck className="h-4 w-4 text-blue-600" />;
      default: return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'text-green-600 bg-green-100';
      case 'IN_TRANSIT': return 'text-blue-600 bg-blue-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Delivery Management</h1>
        <p className="mt-2 text-sm text-gray-700">
          Track and manage all delivery orders.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <Truck className="h-6 w-6 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Deliveries</p>
                <p className="text-2xl font-semibold text-gray-900">{deliveries.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {deliveries.filter(d => d.status === 'PENDING').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <Truck className="h-6 w-6 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">In Transit</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {deliveries.filter(d => d.status === 'IN_TRANSIT').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Delivered</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {deliveries.filter(d => d.status === 'DELIVERED').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Active Deliveries</h2>
        </div>
        
        {loading ? (
          <div className="px-6 py-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading deliveries...</p>
          </div>
        ) : deliveries.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Truck className="h-12 w-12 text-gray-400 mx-auto" />
            <p className="mt-2 text-sm text-gray-500">No deliveries found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tracking
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ETA
                  </th>

                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deliveries.map((delivery) => (
                  <tr key={delivery.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {delivery.orderNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        KSh {delivery.total.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {delivery.customerName}
                        </div>
                        <div className="text-sm text-gray-500">{delivery.customerPhone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start text-sm text-gray-900 max-w-xs">
                        <MapPin className="h-4 w-4 text-gray-400 mr-1 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate" title={delivery.shippingAddress}>
                            {delivery.shippingAddress}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {delivery.trackingNumber ? (
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {delivery.trackingNumber}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">
                          {delivery.status === 'PENDING' ? 'Not assigned' : 'Generating...'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                        {getStatusIcon(delivery.status)}
                        <span className="ml-1">{delivery.status.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(delivery.estimatedDelivery).toLocaleDateString()}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
