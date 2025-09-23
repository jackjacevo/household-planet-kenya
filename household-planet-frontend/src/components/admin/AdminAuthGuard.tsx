'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const { isAuthenticated, user, isLoading, validateToken, refreshAccessToken, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated) {
        router.push('/admin/login');
        return;
      }

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
        router.push('/admin/login');
      }
    };

    if (!isLoading) checkAuth();
  }, [isAuthenticated, user, isLoading, router]);

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

  if (!isAuthenticated || !user) {
    return null;
  }

  const adminRoles = ['ADMIN', 'SUPER_ADMIN', 'STAFF'];
  if (!adminRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}