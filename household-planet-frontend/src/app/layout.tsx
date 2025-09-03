import { Inter } from 'next/font/google'
import './globals.css'
import '../styles/mobile-optimizations.css'
import '../styles/icon-fixes.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { ToastProvider } from '@/contexts/ToastContext'
import { StructuredData } from '@/components/seo/StructuredData'
import { generateOrganizationSchema, generateWebsiteSchema } from '@/lib/seo'
import { ClientLayout } from '@/components/layout/ClientLayout'
import IconPreloader from '@/components/ui/IconPreloader'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', 'arial']
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
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <title>Household Planet Kenya | Kenya's Best Online Shopping platform</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#16a34a" />
        <link rel="manifest" href="/manifest.json" />


        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/images/logo/hp_logo.jpeg" />
        <StructuredData data={globalStructuredData} />
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <IconPreloader />
        <QueryProvider>
          <AuthProvider>
            <ToastProvider>
              <ClientLayout>
                {children}
              </ClientLayout>
            </ToastProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
