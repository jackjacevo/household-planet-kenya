import { Inter } from 'next/font/google'
import './globals.css'
import '../styles/mobile-optimizations.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { StructuredData } from '@/components/seo/StructuredData'
import { generateOrganizationSchema, generateWebsiteSchema } from '@/lib/seo'
import { ClientLayout } from '@/components/layout/ClientLayout'

const inter = Inter({ subsets: ['latin'] })

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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#16a34a" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/svg+xml" href="/icons/icon.svg" />
        <StructuredData data={globalStructuredData} />
      </head>
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </AuthProvider>
      </body>
    </html>
  )
}
