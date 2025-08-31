'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AdminRoute } from '@/components/auth/AdminRoute';
import { useAuth } from '@/contexts/AuthContext';

const navigationPermissions: { [key: string]: string } = {
  '/admin/dashboard': 'view_dashboard',
  '/admin/orders': 'manage_orders',
  '/admin/whatsapp': 'manage_orders',
  '/admin/products': 'manage_products',
  '/admin/categories': 'manage_products',
  '/admin/brands': 'manage_products',
  '/admin/customers': 'manage_customers',
  '/admin/analytics': 'view_analytics',
  '/admin/payments': 'manage_payments',
  '/admin/delivery': 'manage_orders',
  '/admin/inventory': 'manage_products',
  '/admin/staff': 'manage_staff',
  '/admin/activities': 'view_analytics',
  '/admin/settings': 'manage_content',
};
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
  Tag
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'WhatsApp', href: '/admin/whatsapp', icon: MessageCircle },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Categories', href: '/admin/categories', icon: FolderTree },
  { name: 'Brands', href: '/admin/brands', icon: Tag },
  { name: 'Customers', href: '/admin/customers', icon: Users },
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
  const { user, isAdmin, hasPermission } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

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
    return navigation.filter(item => {
      if (isAdmin()) return true;
      const requiredPermission = navigationPermissions[item.href];
      return requiredPermission ? hasPermission(requiredPermission) : false;
    });
  };

  const visibleNavigation = getVisibleNavigation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
            <div className="flex h-16 items-center justify-between px-4">
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 px-2 py-4">
              {visibleNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-blue-100 text-blue-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:top-[84px] lg:bottom-0 lg:flex lg:w-64 lg:flex-col lg:z-30">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4">
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {visibleNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile menu button */}
      <button
        type="button"
        className="fixed top-[88px] left-4 z-40 p-2 bg-white rounded-md shadow-md lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="h-6 w-6 text-gray-700" />
      </button>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="py-6">
          <AdminRoute>
            {children}
          </AdminRoute>
        </main>
      </div>
    </div>
  );
}