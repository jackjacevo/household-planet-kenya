'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import { getImageUrl } from '@/lib/imageUtils';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  MapPin, 
  Phone, 
  Mail, 
  Share2, 
  Facebook, 
  MessageCircle,
  Download,
  Calendar,
  Clock,
  CreditCard,
  User,
  Star,
  ArrowRight,
  Copy,
  ExternalLink,
  Heart,
  ShoppingBag,
  X
} from 'lucide-react';
import Image from 'next/image';
import axios from 'axios';
import { Order } from '@/types';
import STKPushButton from '@/components/payment/STKPushButton';
import { useCart } from '@/hooks/useCart';
import A4Receipt from '@/components/checkout/A4Receipt';
import OrderTrackingProgress from '@/components/orders/OrderTrackingProgress';

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [orderCompletionData, setOrderCompletionData] = useState<any>(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  useEffect(() => {
    if (params.orderId) {
      // Load completion data from localStorage if available
      const completionData = localStorage.getItem('orderCompletionData');
      if (completionData) {
        try {
          const data = JSON.parse(completionData);
          console.log('Loaded completion data:', data);
          setOrderCompletionData(data);
          setShowSuccessAnimation(true);
          // Clean up after 10 seconds instead of 5
          setTimeout(() => {
            localStorage.removeItem('orderCompletionData');
          }, 10000);
        } catch (error) {
          console.error('Error parsing completion data:', error);
        }
      }
      
      loadOrder(params.orderId as string);
    }
  }, [params.orderId]);

  const loadOrder = async (orderId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please log in to view your order details.');
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );
      setOrder(response.data);
      setTrackingNumber(response.data.trackingNumber || generateTrackingNumber());
      
      // Clear cart after successful order confirmation
      const orderCreated = localStorage.getItem('orderCreated');
      if (orderCreated === 'true') {
        clearCart(false, true); // Force clear the cart
        localStorage.removeItem('orderCreated');
        localStorage.removeItem('orderIdToConfirm');
        localStorage.removeItem('checkoutData'); // Clear checkout data
        // Keep completion data for a bit longer for better UX
        setTimeout(() => {
          localStorage.removeItem('orderCompletionData');
        }, 10000);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        setError('Your session has expired. Please log in again to view your order.');
        localStorage.removeItem('token');
      } else if (error.response?.status === 404) {
        setError('Order not found. Please check your order number.');
      } else if (error.response?.status === 403) {
        setError('You do not have permission to view this order.');
      } else {
        setError('Unable to load order details. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const generateTrackingNumber = () => {
    return `HP${Date.now().toString().slice(-8)}`;
  };

  const shareOrder = (platform: string) => {
    const url = window.location.href;
    const text = `I just placed an order at Household Planet Kenya! Order #${order?.orderNumber}`;
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`);
        break;
      default:
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
    }
  };

  const downloadReceipt = () => {
    window.print();
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Package className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-700">Loading your order details...</p>
          <p className="mt-2 text-sm text-gray-500">Please wait while we fetch your order information</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold mb-4 text-red-600">Unable to Load Order</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">{error}</p>
          <div className="space-y-3">
            {error.includes('log in') && (
              <Button 
                onClick={() => router.push('/login')}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <User className="h-4 w-4 mr-2" />
                Log In
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Try Again
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/products')}
              className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="h-10 w-10 text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold mb-4 text-gray-800">Order Not Found</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            We couldn't find the order you're looking for. It may have been removed or the link might be incorrect.
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => router.push('/account/orders')}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View All Orders
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/products')}
              className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const estimatedDelivery = new Date();
  const estimatedDays = typeof order.deliveryLocation === 'object' && order.deliveryLocation?.estimatedDays 
    ? order.deliveryLocation.estimatedDays 
    : 3;
  estimatedDelivery.setDate(estimatedDelivery.getDate() + estimatedDays);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50">
      {/* Success Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-8 relative overflow-hidden">
        {/* Animated background elements */}
        {showSuccessAnimation && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 left-10 w-4 h-4 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="absolute top-20 right-20 w-3 h-3 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-20 left-20 w-2 h-2 bg-white/25 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-10 right-10 w-5 h-5 bg-white/15 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
          </div>
        )}
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className={`inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4 ${
            showSuccessAnimation ? 'animate-bounce' : 'animate-pulse'
          }`}>
            <CheckCircle className="h-12 w-12" />
          </div>
          <h1 className="text-4xl font-bold mb-2">🎉 Order Confirmed!</h1>
          <p className="text-green-100 text-lg mb-2">Thank you for choosing Household Planet Kenya</p>
          
          {/* Show customer name if available from completion data */}
          {orderCompletionData?.customerInfo?.name && (
            <p className="text-green-200 text-sm mb-4">
              Hi {orderCompletionData.customerInfo.name}! Your order is being processed.
            </p>
          )}
          
          <div className="mt-4 inline-flex items-center bg-white/10 rounded-full px-6 py-2">
            <span className="text-sm">Order #{order.orderNumber}</span>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(order.orderNumber);
                // Show a brief success message
                const button = event?.target as HTMLElement;
                const originalText = button.innerHTML;
                button.innerHTML = '✓';
                setTimeout(() => {
                  button.innerHTML = originalText;
                }, 1000);
              }}
              className="ml-2 hover:bg-white/10 p-1 rounded transition-colors"
              title="Copy order number"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 -mt-4">

        {/* Quick Actions Bar */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-8 border border-green-100">
          <div className="flex flex-wrap gap-3 justify-center">
            <Button 
              onClick={() => router.push(`/track-order/${trackingNumber}`)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              <Package className="h-4 w-4 mr-2" />
              Track Order
            </Button>
            <Button 
              variant="outline"
              onClick={downloadReceipt}
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Receipt
            </Button>
            <Button 
              variant="outline"
              onClick={() => shareOrder('whatsapp')}
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Order Tracking Progress */}
            <OrderTrackingProgress
              orderId={order.id}
              orderNumber={order.orderNumber}
              currentStatus={order.status}
              trackingNumber={trackingNumber}
            />

            {/* Order Details */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                  <ShoppingBag className="h-5 w-5 mr-2 text-green-600" />
                  Order Details
                </h2>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Order #{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">Tracking: {trackingNumber}</p>
                </div>
              </div>
            
              {/* Customer & Payment Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <User className="h-4 w-4 mr-2 text-blue-600" />
                    Customer Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">Name:</span> 
                      <span className="font-medium">
                        {orderCompletionData?.customerInfo?.name || 
                         order.customerName || 
                         order.shippingAddress?.fullName || 
                         order.user?.name || 
                         order.user?.fullName || 'Not provided'}
                      </span>
                    </p>
                    <p><span className="text-gray-600">Phone:</span> 
                      <span className="font-medium">
                        {orderCompletionData?.customerInfo?.phone || 
                         order.customerPhone || 
                         order.shippingAddress?.phone || 
                         order.user?.phone || 'Not provided'}
                      </span>
                    </p>
                    {(orderCompletionData?.customerInfo?.email || order.customerEmail || order.user?.email) && (
                      <p><span className="text-gray-600">Email:</span> 
                        <span className="font-medium">
                          {orderCompletionData?.customerInfo?.email || order.customerEmail || order.user?.email}
                        </span>
                      </p>
                    )}
                    <p><span className="text-gray-600">Location:</span> 
                      <span className="font-medium">
                        {orderCompletionData?.deliveryInfo?.location ? 
                          (deliveryLocations?.find(loc => loc.id === orderCompletionData.deliveryInfo.location)?.name || 'Custom Location') :
                          (typeof order.deliveryLocation === 'string' 
                            ? order.deliveryLocation 
                            : order.deliveryLocation?.name || 'Custom Location')}
                      </span>
                    </p>
                    {orderCompletionData?.deliveryInfo?.notes && (
                      <p><span className="text-gray-600">Notes:</span> 
                        <span className="font-medium text-xs">
                          {orderCompletionData.deliveryInfo.notes}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <CreditCard className="h-4 w-4 mr-2 text-green-600" />
                    Payment Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">Method:</span> 
                      <span className="font-medium ml-1">
                        {order.paymentMethod === 'MPESA' && '📱 M-Pesa'}
                        {order.paymentMethod === 'CARD' && '💳 Card'}
                        {order.paymentMethod === 'CASH_ON_DELIVERY' && '💵 Cash on Delivery'}
                        {order.paymentMethod === 'BANK_TRANSFER' && '🏦 Bank Transfer'}
                      </span>
                    </p>
                    <p><span className="text-gray-600">Status:</span> 
                      <span className={`font-medium ml-1 px-2 py-1 rounded-full text-xs ${
                        order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                        order.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.paymentStatus || 'PENDING'}
                      </span>
                    </p>
                    <p><span className="text-gray-600">Total:</span> <span className="font-bold text-green-600">{formatPrice(order.total)}</span></p>
                  </div>
                </div>
              </div>

              {/* Items Ordered */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center">
                  <Package className="h-4 w-4 mr-2 text-green-600" />
                  Items Ordered ({order.items?.length || 0})
                </h3>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={item.id} className="group hover:shadow-md transition-all duration-200 p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100">
                      <div className="flex items-center space-x-4">
                        <div className="w-20 h-20 relative flex-shrink-0">
                          <Image
                            src={getImageUrl((() => {
                              const images = item.product.images;
                              if (Array.isArray(images) && images.length > 0) {
                                return images[0];
                              }
                              if (typeof images === 'string') {
                                try {
                                  const parsed = JSON.parse(images);
                                  return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null;
                                } catch {
                                  return null;
                                }
                              }
                              return null;
                            })())}
                            alt={item.product.name}
                            fill
                            className="object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 group-hover:text-green-600 transition-colors">
                            {item.product.name}
                          </h4>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                              Qty: {item.quantity}
                            </span>
                            <span className="text-sm text-gray-600">
                              {formatPrice(item.price)} each
                            </span>
                          </div>
                          {item.variant && (
                            <p className="text-sm text-gray-500 mt-1">
                              {item.variant.size && `Size: ${item.variant.size}`}
                              {item.variant.color && ` • Color: ${item.variant.color}`}
                              {item.variant.name && ` • ${item.variant.name}`}
                            </p>
                          )}
                          {item.product.sku && (
                            <p className="text-xs text-gray-400 mt-1">SKU: {item.product.sku}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-green-600">{formatPrice(item.total)}</p>
                          <p className="text-xs text-gray-500">{item.quantity} × {formatPrice(item.price)}</p>
                          <button className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center">
                            <Heart className="h-3 w-3 mr-1" />
                            Add to Wishlist
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
          </div>

            {/* Delivery Information */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <Truck className="h-5 w-5 mr-2 text-green-600" />
                Delivery Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {order.deliveryLocation && (
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-lg border border-orange-100">
                    <h3 className="font-medium mb-3 flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-orange-600" />
                      Delivery Location
                    </h3>
                    <div className="space-y-2">
                      <p className="font-semibold text-gray-800">{order.deliveryLocation}</p>
                      <p className="text-sm text-gray-600">
                        Delivery Cost: <span className="font-medium text-orange-600">{formatPrice(order.deliveryPrice || order.shippingCost || 0)}</span>
                      </p>
                      {order.shippingAddress && (
                        <div className="text-sm text-gray-600">
                          <p>{order.shippingAddress.street}</p>
                          <p>{order.shippingAddress.town}, {order.shippingAddress.county}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
                  <h3 className="font-medium mb-3 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-purple-600" />
                    Delivery Timeline
                  </h3>
                  <div className="space-y-2">
                    <p className="font-semibold text-purple-600">
                      {estimatedDelivery.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-gray-600">
                      {estimatedDays} business days
                    </p>
                    <p className="text-xs text-gray-500">
                      We'll notify you when your order ships
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Share & Recommendations */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Share2 className="h-5 w-5 mr-2 text-green-600" />
                Share Your Purchase
              </h2>
              <p className="text-gray-600 mb-6">Let your friends know about your great finds at Household Planet Kenya!</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareOrder('facebook')}
                  className="flex items-center justify-center border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <Facebook className="h-4 w-4 mr-2" />
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareOrder('twitter')}
                  className="flex items-center justify-center border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  X
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareOrder('whatsapp')}
                  className="flex items-center justify-center border-green-300 text-green-700 hover:bg-green-50"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareOrder('copy')}
                  className="flex items-center justify-center border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
              </div>
              
              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="font-semibold mb-3">What's Next?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/products')}
                    className="flex items-center justify-center border-orange-300 text-orange-700 hover:bg-orange-50"
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Continue Shopping
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/account/orders')}
                    className="flex items-center justify-center border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View All Orders
                  </Button>
                </div>
              </div>
            </div>
        </div>

          <div>
            {/* Order Summary Sidebar */}
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4 border border-green-100">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-green-600" />
                Order Summary
              </h2>
              
              {/* Order Total Breakdown */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg mb-6 border border-green-100">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({order.items?.length || 0} items)</span>
                    <span className="font-medium">{formatPrice(order.subtotal)}</span>
                  </div>
                  {order.promoCode && order.discountAmount && order.discountAmount > 0 && (
                    <div className="flex justify-between text-sm bg-green-50 -mx-2 px-2 py-1 rounded">
                      <span className="text-green-700 font-medium">Promo Discount ({order.promoCode})</span>
                      <span className="font-medium text-green-600">-{formatPrice(order.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Cost</span>
                    <span className="font-medium">{formatPrice(order.deliveryPrice || order.shippingCost || 0)}</span>
                  </div>
                  <div className="border-t border-green-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-gray-800">Total Amount</span>
                      <span className="text-2xl font-bold text-green-600">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
              


              {/* Action Buttons */}
              <div className="space-y-3 mb-6">
                <Button 
                  onClick={() => router.push(`/track-order/${trackingNumber}`)}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  size="lg"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Track Your Order
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => router.push('/account/orders')}
                  className="w-full border-green-300 text-green-700 hover:bg-green-50"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View All Orders
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => router.push('/products')}
                  className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Continue Shopping
                </Button>
              </div>

              {/* Customer Support */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-semibold mb-3 text-gray-800 flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-blue-600" />
                  Need Help?
                </h3>
                <div className="space-y-2 text-sm">
                  <a href="tel:+254790227760" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                    <Phone className="h-3 w-3 mr-2" />
                    +254790 227 760
                  </a>
                  <a href="mailto:householdplanet819@gmail.com" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                    <Mail className="h-3 w-3 mr-2" />
                    householdplanet819@gmail.com
                  </a>
                  <p className="flex items-center text-gray-600">
                    <Clock className="h-3 w-3 mr-2" />
                    Mon-Fri: 8AM-6PM
                  </p>
                </div>
              </div>
              
              {/* Rating Prompt */}
              <div className="mt-6 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-100">
                <h3 className="font-semibold mb-2 text-gray-800 flex items-center">
                  <Star className="h-4 w-4 mr-2 text-yellow-600" />
                  Rate Your Experience
                </h3>
                <p className="text-sm text-gray-600 mb-3">Help other customers by sharing your experience!</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                  onClick={() => router.push('/account/orders')}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Leave a Review
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* A4 Receipt for Printing */}
      <A4Receipt order={order} trackingNumber={trackingNumber} />
    </div>
  );
}