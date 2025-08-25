'use client';

// Fixed API endpoint to use /api/orders instead of /api/delivery/admin/orders
import { useState, useEffect } from 'react';
import { Truck, MapPin, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import axios from 'axios';

interface DeliveryOrder {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  status: string;
  estimatedDelivery: string;
  trackingNumber: string;
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      // Map orders data to delivery format
      const orders = response.data.orders || response.data;
      const mappedDeliveries = orders.map((order: any) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.user?.name || order.customerName || 'Unknown',
        customerPhone: order.user?.phone || order.customerPhone || 'N/A',
        shippingAddress: typeof order.shippingAddress === 'string' 
          ? order.shippingAddress 
          : JSON.stringify(order.shippingAddress) || 'N/A',
        status: order.status,
        estimatedDelivery: order.estimatedDelivery || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        trackingNumber: order.trackingNumber || `TRK-${order.id}`,
        total: order.total || 0
      }));
      setDeliveries(mappedDeliveries);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      // Mock data for demo
      setDeliveries([
        {
          id: 1,
          orderNumber: 'ORD-001',
          customerName: 'John Doe',
          customerPhone: '+254712345678',
          shippingAddress: 'Nairobi, Kenya',
          status: 'IN_TRANSIT',
          estimatedDelivery: '2024-01-20',
          trackingNumber: 'TRK-001',
          total: 5000
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const updateDeliveryStatus = async (deliveryId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${deliveryId}/status`,
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deliveries.map((delivery) => (
                <tr key={delivery.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      #{delivery.orderNumber}
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                      {delivery.shippingAddress}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {delivery.trackingNumber}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {delivery.status === 'PENDING' && (
                      <Button
                        size="sm"
                        onClick={() => updateDeliveryStatus(delivery.id, 'IN_TRANSIT')}
                      >
                        Start Delivery
                      </Button>
                    )}
                    {delivery.status === 'IN_TRANSIT' && (
                      <Button
                        size="sm"
                        onClick={() => updateDeliveryStatus(delivery.id, 'DELIVERED')}
                      >
                        Mark Delivered
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      Track
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}