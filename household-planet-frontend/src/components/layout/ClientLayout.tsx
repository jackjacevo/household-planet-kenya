'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { PersistentDataSync } from '@/components/ui/PersistentDataSync'
import { socketService } from '@/lib/socket'

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname === '/login' || pathname === '/register'
  const isAdminPage = pathname.startsWith('/admin')

  return (
    <div className="min-h-screen flex flex-col">
      {!isAuthPage && <Header />}
      <main className="flex-1">
        {children}
      </main>
      {!isAuthPage && !isAdminPage && <Footer />}
    </div>
  )
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize WebSocket connection for real-time updates
    socketService.connect()
    
    return () => {
      socketService.disconnect()
    }
  }, [])

  return (
    <>
      <PersistentDataSync />
      <LayoutContent>{children}</LayoutContent>
    </>
  )
}
