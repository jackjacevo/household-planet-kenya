'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { PersistentDataSync } from '@/components/ui/PersistentDataSync'
import { socketService } from '@/lib/socket'
import { setupAuthInterceptor } from '@/lib/auth-interceptor'

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname === '/login' || pathname === '/register'
  const isAdminPage = pathname.startsWith('/admin')

  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden">
      {!isAuthPage && <Header />}
      <main className="flex-1 w-full">
        {children}
      </main>
      {!isAuthPage && !isAdminPage && <Footer />}
    </div>
  )
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Setup auth interceptor for API calls
    setupAuthInterceptor()

    // Initialize WebSocket connection for real-time updates (disabled for production)
    if (process.env.NODE_ENV === 'development') {
      socketService.connect()

      return () => {
        socketService.disconnect()
      }
    }
  }, [])

  return (
    <>
      <PersistentDataSync />
      <LayoutContent>{children}</LayoutContent>
    </>
  )
}
