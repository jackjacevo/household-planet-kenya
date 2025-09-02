import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Household Planet Kenya - Premium Home & Living',
  description: 'Discover premium home essentials, furniture, and lifestyle products for the modern Kenyan home.',
  keywords: 'home decor, furniture, kitchenware, household items, Kenya, premium living',
  openGraph: {
    title: 'Household Planet Kenya',
    description: 'Premium home & living essentials',
    type: 'website',
    locale: 'en_KE',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  )
}