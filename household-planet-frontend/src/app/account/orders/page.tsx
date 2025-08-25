'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import { Package, Eye, RotateCcw, Download, Search } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/my-orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else {
        console.error('Failed to fetch orders:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const reorderItems = async (orderId: number) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/reorder`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('Items added to cart!');
    } catch (error) {
      console.error('Error reordering:', error);
    }
  };

  const filteredOrders = orders.filter((order: any) =>
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Order History</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse border rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order: any) => (
              <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">Order #{order.orderNumber}</h3>
                    <p className="text-sm text-gray-500">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                      order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                    <span className="font-semibold">{formatPrice(order.total)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  {order.items?.slice(0, 3).map((item: any) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <div className="w-12 h-12 relative">
                        <Image
                          src={item.product.images?.[0] || '/placeholder.jpg'}
                          alt={item.product.name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  {order.items?.length > 3 && (
                    <div className="flex items-center justify-center text-sm text-gray-500">
                      +{order.items.length - 3} more items
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link href={`/order-confirmation/${order.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </Link>
                  
                  {order.status === 'DELIVERED' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => reorderItems(order.id)}
                      >
                        <Package className="h-4 w-4 mr-1" />
                        Reorder
                      </Button>
                      
                      <Link href={`/account/invoices/${order.id}`}>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Invoice
                        </Button>
                      </Link>
                      
                      <Link href={`/account/returns?orderId=${order.id}`}>
                        <Button variant="outline" size="sm">
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Return
                        </Button>
                      </Link>
                    </>
                  )}
                  
                  {order.trackingNumber && (
                    <Link href={`/track/${order.trackingNumber}`}>
                      <Button variant="outline" size="sm">
                        Track Order
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : "You haven't placed any orders yet"}
            </p>
            <Link href="/products">
              <Button>Start Shopping</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}