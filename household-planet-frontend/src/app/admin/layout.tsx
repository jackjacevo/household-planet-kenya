'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';
import { useAuthStore } from '@/lib/store/authStore';
import { AdminErrorBoundary } from '@/components/error/AdminErrorBoundary';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useRealtimeOrders } from '@/lib/realtime';


import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Package, 
  BarChart3, 
  Settings,
  CreditCard,
  Truck,
  AlertTriangle,
  MessageCircle,
  Menu,
  X,
  Activity,
  FolderTree,
  Tag,
  Percent,
  LogOut
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'WhatsApp', href: '/admin/whatsapp', icon: MessageCircle },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Categories', href: '/admin/categories', icon: FolderTree },
  { name: 'Brands', href: '/admin/brands', icon: Tag },
  { name: 'Promo Codes', href: '/admin/promo-codes', icon: Percent },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  // { name: 'Loyalty', href: '/admin/loyalty', icon: Star },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard },
  { name: 'Delivery', href: '/admin/delivery', icon: Truck },
  { name: 'Inventory', href: '/admin/inventory', icon: AlertTriangle },
  { name: 'Staff', href: '/admin/staff', icon: Users },
  { name: 'Activities', href: '/admin/activities', icon: Activity },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const queryClient = useQueryClient();
  const { refreshAll } = useRealtimeOrders();

  const fetchPendingOrdersCount = async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token');
    
    const response = await api.get('/admin/dashboard');
    return (response.data as any)?.overview?.pendingOrders || 0;
  };

  const { data: pendingOrdersCount = 0 } = useQuery({
    queryKey: ['pendingOrdersCount'],
    queryFn: fetchPendingOrdersCount,
    refetchInterval: 10000,
    enabled: !!(mounted && isAuthenticated && user && ['ADMIN', 'SUPER_ADMIN', 'STAFF'].includes(user.role)),
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('Authentication')) return false;
      return failureCount < 2;
    }
  });

  // Listen for order changes and invalidate the count
  useEffect(() => {
    const handleOrderChange = () => {
      queryClient.invalidateQueries({ queryKey: ['pendingOrdersCount'] });
    };

    // Listen for custom events that indicate order changes
    window.addEventListener('orderCreated', handleOrderChange);
    window.addEventListener('orderStatusChanged', handleOrderChange);
    
    return () => {
      window.removeEventListener('orderCreated', handleOrderChange);
      window.removeEventListener('orderStatusChanged', handleOrderChange);
    };
  }, [queryClient]);

  useEffect(() => {
    setMounted(true);
    // Also invalidate on mount to ensure fresh data
    if (isAuthenticated && user && ['ADMIN', 'SUPER_ADMIN', 'STAFF'].includes(user.role)) {
      queryClient.invalidateQueries({ queryKey: ['pendingOrdersCount'] });
      
      // Start real-time sync
      import('@/lib/realtime').then(({ realtimeSync }) => {
        realtimeSync.connect(queryClient);
      });
    }
    
    return () => {
      import('@/lib/realtime').then(({ realtimeSync }) => {
        realtimeSync.disconnect();
      });
    };
  }, [queryClient, isAuthenticated, user]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const getVisibleNavigation = () => {
    // Admin, Super Admin, and Staff can see all navigation items
    if (user && ['ADMIN', 'SUPER_ADMIN', 'STAFF'].includes(user.role)) {
      return navigation;
    }
    return [];
  };

  const visibleNavigation = getVisibleNavigation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-72 sm:w-80 flex-col bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Admin Panel</h1>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
              {visibleNavigation.map((item) => {
                const isActive = pathname === item.href;
                const showBadge = item.href === '/admin/orders' && pendingOrdersCount > 0;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-900 border-l-4 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                    {showBadge && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                        {pendingOrdersCount > 99 ? '99+' : pendingOrdersCount}
                      </span>
                    )}
                  </Link>
                );
              })}
              {user && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {user.email}
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setSidebarOpen(false);
                    }}
                    className="group flex items-center w-full px-3 py-3 text-sm font-medium rounded-lg transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
                    <span className="truncate">Logout</span>
                  </button>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:top-[140px] lg:bottom-0 lg:flex lg:w-64 lg:flex-col lg:z-30">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4 border-b border-gray-100">
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
            {visibleNavigation.map((item) => {
              const isActive = pathname === item.href;
              const showBadge = item.href === '/admin/orders' && pendingOrdersCount > 0;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-900 border-l-4 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                  {showBadge && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                      {pendingOrdersCount > 99 ? '99+' : pendingOrdersCount}
                    </span>
                  )}
                </Link>
              );
            })}
            {user && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {user.email}
                </div>
                <button
                  onClick={logout}
                  className="group flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Logout
                </button>
              </div>
            )}
          </nav>
        </div>
      </div>

      {/* Mobile menu button */}
      <button
        type="button"
        className="fixed top-[144px] left-4 z-30 p-3 bg-white rounded-lg shadow-lg lg:hidden border border-gray-200 hover:bg-gray-50 transition-colors"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="h-5 w-5 text-gray-700" />
      </button>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="py-4 px-2 sm:py-6 sm:px-4">
          <AdminAuthGuard>
            <AdminErrorBoundary>
              {children}
            </AdminErrorBoundary>
          </AdminAuthGuard>
        </main>
      </div>
    </div>
  );
}
