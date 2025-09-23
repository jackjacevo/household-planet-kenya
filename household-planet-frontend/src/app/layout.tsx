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
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const orig = console.log;
              const origError = console.error;
              const origWarn = console.warn;
              
              const filterBase64 = (args) => {
                return args.map(arg => {
                  if (typeof arg === 'string') {
                    if (arg.includes('websocket') || arg.includes('connection disabled')) return null;
                    if (arg.includes('data:image/')) {
                      return arg.replace(/data:image\/[^;]+;base64,[A-Za-z0-9+\/=]+/g, 'data:image/[BASE64_HIDDEN]');
                    }
                  }
                  return arg;
                }).filter(arg => arg !== null);
              };
              
              console.log = function(...args) {
                const filtered = filterBase64(args);
                if (filtered.length > 0) orig.apply(console, filtered);
              };
              
              console.error = function(...args) {
                const filtered = filterBase64(args);
                if (filtered.length > 0) origError.apply(console, filtered);
              };
              
              console.warn = function(...args) {
                const filtered = filterBase64(args);
                if (filtered.length > 0) origWarn.apply(console, filtered);
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
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{
          __html: `
            if (typeof window !== 'undefined') {
              // Auth interceptor will be set up by the client components
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