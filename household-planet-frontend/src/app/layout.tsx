import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import Navigation from '@/components/Navigation'
import MobileNavigation from '@/components/MobileNavigation'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'
import PWAUpdateNotification from '@/components/PWAUpdateNotification'
import OfflineIndicator from '@/components/OfflineIndicator'
import PWAStatus from '@/components/PWAStatus'
import PWALoadingScreen from '@/components/PWALoadingScreen'
import PWAPerformanceMonitor from '@/components/PWAPerformanceMonitor'
import PerformanceOptimizer from '@/components/PerformanceOptimizer'
import ResourcePreloader from '@/components/ResourcePreloader'
import CriticalCSS from '@/components/CriticalCSS'
import WhatsAppFloating from '@/components/WhatsAppFloating'
import AbandonedCartTracker from '@/components/AbandonedCartTracker'
import LiveChat from '@/components/LiveChat'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { Metadata, Viewport } from 'next'
import GoogleAnalytics from '@/components/Analytics/GoogleAnalytics'
import GoogleTagManager from '@/components/Analytics/GoogleTagManager'
import FacebookPixel from '@/components/Analytics/FacebookPixel'
import HotjarScript from '@/components/Analytics/HotjarScript'
import { generateOrganizationSchema } from '@/lib/seo'
import SchemaMarkup from '@/components/SEO/SchemaMarkup'

export const metadata: Metadata = {
  title: {
    default: 'Household Planet Kenya - Premium Home Essentials',
    template: '%s | Household Planet Kenya'
  },
  description: 'Shop premium household essentials across Kenya. Quality products, fast delivery, and exceptional service for your home. Free delivery in Nairobi, Mombasa, and major cities.',
  keywords: 'household items Kenya, home essentials, kitchen appliances, cleaning supplies, home decor, furniture Kenya, online shopping Kenya, e-commerce Kenya',
  authors: [{ name: 'Household Planet Kenya' }],
  creator: 'Household Planet Kenya',
  publisher: 'Household Planet Kenya',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://householdplanet.co.ke'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    url: 'https://householdplanet.co.ke',
    title: 'Household Planet Kenya - Premium Home Essentials',
    description: 'Transform your home with quality household essentials delivered across Kenya',
    siteName: 'Household Planet Kenya',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Household Planet Kenya - Premium Home Essentials',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Household Planet Kenya - Premium Home Essentials',
    description: 'Quality household items delivered across Kenya',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Household Planet Kenya',
  },
  applicationName: 'Household Planet Kenya',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3b82f6' },
    { media: '(prefers-color-scheme: dark)', color: '#3b82f6' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const organizationSchema = generateOrganizationSchema();

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Household Planet" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className="antialiased bg-gray-50">
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
        >
          Skip to main content
        </a>
        <CriticalCSS />
        <ResourcePreloader />
        <SchemaMarkup schema={organizationSchema} />
        <GoogleAnalytics />
        <GoogleTagManager />
        <FacebookPixel />
        <HotjarScript />
        <PWAPerformanceMonitor />
        <PerformanceOptimizer />
        <ErrorBoundary>
          <AuthProvider>
            <CartProvider>
              <div className="critical-layout pb-16 md:pb-0">
                <Navigation />
                <OfflineIndicator />
                <PWAUpdateNotification />
                <div id="main-content" className="flex-1">
                  {children}
                </div>
                <MobileNavigation />
                <PWAInstallPrompt />
                <PWAStatus />
                <WhatsAppFloating />
                <AbandonedCartTracker />
                <LiveChat />
              </div>
            </CartProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}