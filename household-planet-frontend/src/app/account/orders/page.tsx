'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import { getImageUrl } from '@/lib/imageUtils';
import { Package, Eye, RotateCcw, Download, Search, RefreshCw, MapPin } from 'lucide-react';
import Link from 'next/link';

import STKPushButton from '@/components/payment/STKPushButton';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchOrders();
    
    // Check if user just created an order and refresh the list
    const orderCreated = localStorage.getItem('orderCreated');
    if (orderCreated) {
      localStorage.removeItem('orderCreated');
      // Small delay to ensure order is processed
      setTimeout(() => {
        fetchOrders();
      }, 1000);
    }
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ No authentication token found');
        setLoading(false);
        return;
      }
      
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/orders/my-orders`;
      console.log('🔍 Fetching orders from:', apiUrl);
      console.log('🔑 Token exists:', !!token);
      
      const response = await fetch(apiUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Orders fetched successfully');
        console.log('📊 Orders count:', data.orders?.length || 0);
        console.log('📋 Orders data structure:', {
          hasOrders: !!data.orders,
          isArray: Array.isArray(data.orders),
          firstOrder: data.orders?.[0] ? {
            id: data.orders[0].id,
            orderNumber: data.orders[0].orderNumber,
            status: data.orders[0].status
          } : null
        });
        setOrders(data.orders || []);
      } else {
        console.error('❌ Failed to fetch orders:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        
        // If unauthorized, might need to refresh login
        if (response.status === 401) {
          console.log('🔄 Token might be expired, consider redirecting to login');
        }
      }
    } catch (error) {
      console.error('❌ Network error fetching orders:', error);
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



  const filteredOrders = orders.filter((order: any) => {
    const matchesSearch = order?.orderNumber?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false;
    const matchesStatus = statusFilter === 'ALL' || order?.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Order History</h1>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setLoading(true);
                fetchOrders();
              }}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {mounted && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white"
              >
                <option value="ALL">All Orders</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            )}
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white"
              />
            </div>
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
        ) : filteredOrders && filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.filter(order => order && order.id && order.orderNumber).map((order: any) => (
              <div key={order.id} className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <h3 className="font-semibold text-base sm:text-lg">Order #{order.orderNumber}</h3>
                      {order.source === 'WHATSAPP' && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516"/>
                          </svg>
                          WA
                        </span>
                      )}
                      {order.priority && order.priority !== 'NORMAL' && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                          order.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.priority}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    {order.deliveryLocation && (
                      <p className="text-sm text-gray-500">
                        Delivery: {order.deliveryLocation}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col sm:items-end space-y-1">
                    <div className="flex items-center justify-between sm:justify-end space-x-2">
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                        order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'PROCESSING' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                      <span className="font-semibold text-sm sm:text-base">{formatPrice(order.total)}</span>
                    </div>
                    {order.paymentStatus && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                        order.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        Payment: {order.paymentStatus}
                      </span>
                    )}
                    {order.paymentMethod && (
                      <p className="text-xs text-gray-500">
                        via {order.paymentMethod === 'MPESA' ? 'M-Pesa' : 
                            order.paymentMethod === 'CASH_ON_DELIVERY' ? 'Cash on Delivery' :
                            order.paymentMethod}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {order.items && order.items.length > 0 ? order.items.slice(0, 3).filter(item => item && item.product).map((item: any) => (
                      <div key={item.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 relative">
                          <img
                            src={(() => {
                              const images = item.product?.images;
                              if (!images) return '/images/products/placeholder.svg';
                              if (typeof images === 'string') {
                                try {
                                  const parsed = JSON.parse(images);
                                  return getImageUrl(Array.isArray(parsed) ? parsed[0] : images);
                                } catch {
                                  return getImageUrl(images);
                                }
                              }
                              return getImageUrl(Array.isArray(images) ? images[0] : images);
                            })()}
                            alt={item.product?.name || 'Product'}
                            className="w-full h-full object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.src = '/images/products/placeholder.svg';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.product.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          {item.variant && (
                            <p className="text-xs text-gray-500">{item.variant.name}</p>
                          )}
                          <p className="text-xs font-medium">{formatPrice(item.total)}</p>
                        </div>
                      </div>
                    )) : (
                      <div className="col-span-full text-center text-gray-500">
                        No items found
                      </div>
                    )}
                    {order.items && order.items.length > 3 && (
                      <div className="flex items-center justify-center text-sm text-gray-500 p-2 bg-gray-50 rounded-lg">
                        +{order.items.length - 3} more items
                      </div>
                    )}
                  </div>
                  
                  {/* Order Summary */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Subtotal:</span>
                        <p className="font-medium">{formatPrice(order.subtotal)}</p>
                      </div>
                      {order.promoCode && order.discountAmount > 0 && (
                        <div>
                          <span className="text-gray-500">Promo ({order.promoCode}):</span>
                          <p className="font-medium text-green-600">-{formatPrice(order.discountAmount)}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">Delivery Cost:</span>
                        <p className="font-medium">{formatPrice(order.deliveryPrice || order.shippingCost || 0)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Items:</span>
                        <p className="font-medium">{order.items?.length || 0}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Total:</span>
                        <p className="font-bold text-lg">{formatPrice(order.subtotal - (order.discountAmount || 0) + (order.deliveryPrice || order.shippingCost || 0))}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link href={`/order-confirmation/${order.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </Link>
                  
                  {order.trackingNumber && (
                    <Link href={`/track-order/${order.trackingNumber}`}>
                      <Button variant="outline" size="sm">
                        <MapPin className="h-4 w-4 mr-1" />
                        Track Order
                      </Button>
                    </Link>
                  )}
                  
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