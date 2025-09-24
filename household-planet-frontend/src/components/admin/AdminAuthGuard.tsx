'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { useAuth } from '@/contexts/AuthContext';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const { isAuthenticated, user, isLoading, validateToken, refreshAccessToken, logout } = useAuthStore();
  const { user: contextUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      // Check if user is authenticated in either system
      const hasStoreAuth = isAuthenticated && user;
      const hasContextAuth = contextUser;
      
      if (!hasStoreAuth && !hasContextAuth) {
        router.push('/admin/login');
        return;
      }

      // If user is authenticated via context but not admin, redirect to homepage
      if (hasContextAuth && !hasStoreAuth) {
        const isAdmin = contextUser && ['ADMIN', 'SUPER_ADMIN', 'STAFF', 'admin', 'super_admin', 'staff'].includes(contextUser.role);
        if (!isAdmin) {
          router.push('/');
          return;
        }
      }

      // If using store auth, validate token
      if (hasStoreAuth) {
        try {
          const isValid = await validateToken();
          if (!isValid) {
            const refreshed = await refreshAccessToken();
            if (!refreshed) {
              logout();
              router.push('/admin/login');
              return;
            }
          }
        } catch {
          logout();
          router.push('/admin/login');
          return;
        }

        if (user && !['ADMIN', 'SUPER_ADMIN', 'STAFF'].includes(user.role)) {
          router.push('/');
        }
      }
    };

    if (!isLoading) checkAuth();
  }, [isAuthenticated, user, isLoading, contextUser, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-sm sm:text-base text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Check authentication from both systems
  const hasStoreAuth = isAuthenticated && user;
  const hasContextAuth = contextUser;
  
  if (!hasStoreAuth && !hasContextAuth) {
    return null;
  }

  // Check admin roles from both systems
  const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'STAFF', 'admin', 'super_admin', 'staff'];
  const isStoreAdmin = user && adminRoles.includes(user.role);
  const isContextAdmin = contextUser && adminRoles.includes(contextUser.role);
  
  if (!isStoreAdmin && !isContextAdmin) {
    return null;
  }

  return <>{children}</>;
}