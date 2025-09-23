'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  User, 
  ShoppingBag, 
  MapPin, 
  Heart, 
  FileText, 
  RotateCcw, 
  MessageSquare, 
  Settings,
  Menu,
  X
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/account', icon: User },
  { name: 'Orders', href: '/account/orders', icon: ShoppingBag },
  { name: 'Wishlist', href: '/account/wishlist', icon: Heart },
  // { name: 'Loyalty', href: '/account/loyalty', icon: Star },
  { name: 'Invoices', href: '/account/invoices', icon: FileText },
  { name: 'Returns', href: '/account/returns', icon: RotateCcw },
  { name: 'Support', href: '/account/support', icon: MessageSquare },
  { name: 'Settings', href: '/account/settings', icon: Settings },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-2 sm:px-4 lg:max-w-7xl lg:mx-auto py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
          <div className="lg:hidden">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex items-center justify-center w-full p-2.5 sm:p-3 bg-white rounded-lg shadow-sm border text-sm sm:text-base"
            >
              {sidebarOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Menu className="h-4 w-4 sm:h-5 sm:w-5" />}
              <span className="ml-2">Account Menu</span>
            </button>
          </div>

          <div className={`lg:w-64 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">My Account</h2>
              <nav className="space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center px-2.5 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-orange-50 text-orange-600 border-r-2 border-orange-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2 sm:mr-3" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
