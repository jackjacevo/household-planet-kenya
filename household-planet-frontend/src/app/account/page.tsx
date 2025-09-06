'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import { 
  ShoppingBag, 
  Star, 
  MapPin, 
  Heart, 
  TrendingUp, 
  Package,
  Clock,
  CheckCircle,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function AccountDashboard() {
  const { user } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const { items: cartItems } = useCart();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    loyaltyPoints: 0,
    wishlistItems: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [statsRes, ordersRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/dashboard-stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/my-orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        const orders = Array.isArray(ordersData) ? ordersData : [];
        setRecentOrders(orders.slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Please log in to access your account</h1>
        <Link href="/login">
          <Button>Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
            {user.avatar ? (
              <Image src={user.avatar} alt={user.name} width={64} height={64} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-lg sm:text-2xl font-bold text-orange-600">
                {user.name?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">Welcome back, {user.name}!</h1>
            <p className="text-sm sm:text-base text-gray-600 truncate">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6">
          <div className="flex items-center">
            <ShoppingBag className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
            <div className="ml-2 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6">
          <div className="flex items-center">
            <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
            <div className="ml-2 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Total Spent</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{formatPrice(stats.totalSpent)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6">
          <div className="flex items-center">
            <Star className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
            <div className="ml-2 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Loyalty Points</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.loyaltyPoints}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6">
          <div className="flex items-center">
            <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
            <div className="ml-2 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Wishlist Items</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{wishlistItems?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6">
          <div className="flex items-center">
            <ShoppingBag className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
            <div className="ml-2 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Cart Items</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-semibold">Recent Orders</h2>
            <Link href="/account/orders">
              <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">View All</Button>
            </Link>
          </div>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Package className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">Order #{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatPrice(order.total)}</p>
                    <div className="flex items-center text-sm">
                      {order.status === 'DELIVERED' ? (
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-500 mr-1" />
                      )}
                      <span className={order.status === 'DELIVERED' ? 'text-green-600' : 'text-yellow-600'}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No orders yet</p>
              <Link href="/products">
                <Button className="mt-4">Start Shopping</Button>
              </Link>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <Link href="/cart">
              <Button variant="outline" className="w-full h-16 sm:h-20 flex flex-col items-center justify-center relative">
                <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                <span className="text-xs sm:text-sm">Cart</span>
                {cartItems && cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                  </span>
                )}
              </Button>
            </Link>
            <Link href="/account/orders">
              <Button variant="outline" className="w-full h-16 sm:h-20 flex flex-col items-center justify-center">
                <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                <span className="text-xs sm:text-sm">View Orders</span>
              </Button>
            </Link>
            
            <Link href="/account/addresses">
              <Button variant="outline" className="w-full h-16 sm:h-20 flex flex-col items-center justify-center">
                <MapPin className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                <span className="text-xs sm:text-sm">Addresses</span>
              </Button>
            </Link>
            
            <Link href="/account/wishlist">
              <Button variant="outline" className="w-full h-16 sm:h-20 flex flex-col items-center justify-center relative">
                <Heart className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                <span className="text-xs sm:text-sm">Wishlist</span>
                {wishlistItems && wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistItems?.length || 0}
                  </span>
                )}
              </Button>
            </Link>
            
            <Link href="/account/support">
              <Button variant="outline" className="w-full h-16 sm:h-20 flex flex-col items-center justify-center">
                <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                <span className="text-xs sm:text-sm">Support</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}