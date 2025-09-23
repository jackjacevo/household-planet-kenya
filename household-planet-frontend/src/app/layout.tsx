import { Inter } from 'next/font/google'
import './globals.css'
import '../styles/mobile-optimizations.css'

import { QueryProvider } from '@/components/providers/QueryProvider'
import { ToastProvider } from '@/contexts/ToastContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { StructuredData } from '@/components/SEO/StructuredData'
import { generateOrganizationSchema, generateWebsiteSchema } from '@/lib/seo'
import { ClientLayout } from '@/components/layout/ClientLayout'
import IconPreloader from '@/components/ui/IconPreloader'
import SmoothScrollProvider from '@/components/ui/SmoothScrollProvider'
import { setupAuthInterceptor } from '@/lib/auth-interceptor'
import ToastContainer from '@/components/ui/Toast'
import { ErrorBoundary } from '@/components/error/ErrorBoundary'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const globalStructuredData = [
    generateOrganizationSchema(),
    generateWebsiteSchema()
  ]

  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const orig = console.log;
              console.log = function(...args) {
                const msg = String(args[0] || '').toLowerCase();
                if (msg.includes('websocket') || msg.includes('connection disabled')) return;
                orig.apply(console, args);
              };
            })();
          `
        }} />
        <title>Household Planet Kenya | Kenya's Best Online Shopping platform</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#16a34a" />
        <link rel="manifest" href="/manifest.json" />


        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/images/logo/hp_logo.jpeg" />
        <StructuredData data={globalStructuredData} />
      </head>
      <body className={`${inter.className} antialiased scroll-smooth`} suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{
          __html: `
            if (typeof window !== 'undefined') {
              import('/lib/auth-interceptor').then(module => module.setupAuthInterceptor());
            }
          `
        }} />
        <IconPreloader />
        <SmoothScrollProvider />
        <ErrorBoundary>
          <QueryProvider>
            <ToastProvider>
              <AuthProvider>
                <ClientLayout>
                  {children}
                </ClientLayout>
              </AuthProvider>
              <ToastContainer />
            </ToastProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}