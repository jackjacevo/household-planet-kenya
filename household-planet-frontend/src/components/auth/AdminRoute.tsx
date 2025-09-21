'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface AdminRouteProps {
  children: React.ReactNode
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading, isAdmin, isStaff } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
        return
      }
      
      // Allow ADMIN, SUPER_ADMIN, and STAFF roles
      if (!(user?.role === 'ADMIN' || user?.role === 'admin' || user?.role === 'SUPER_ADMIN' || user?.role === 'super_admin' || user?.role === 'STAFF' || user?.role === 'staff')) {
        router.push('/dashboard')
        return
      }
    }
  }, [user, loading, isAdmin, isStaff, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!user || !(user?.role === 'ADMIN' || user?.role === 'admin' || user?.role === 'SUPER_ADMIN' || user?.role === 'super_admin' || user?.role === 'STAFF' || user?.role === 'staff')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
