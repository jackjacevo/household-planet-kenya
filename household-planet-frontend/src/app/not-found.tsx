'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { HomeIcon, MagnifyingGlassIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import SEOHead from '@/components/seo/SEOHead'
import { generateOrganizationSchema, generateWebsiteSchema } from '@/lib/seo'

export default function NotFound() {
  const structuredData = [
    generateOrganizationSchema(),
    generateWebsiteSchema()
  ]

  return (
    <>
      <SEOHead
        title="Page Not Found - 404 Error"
        description="The page you're looking for doesn't exist. Browse our quality household products or return to the homepage."
        url="/404"
        structuredData={structuredData}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* 404 Number */}
            <motion.h1 
              className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-4"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              404
            </motion.h1>
            
            {/* Error Message */}
            <motion.h2 
              className="text-2xl md:text-3xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Oops! Page Not Found
            </motion.h2>
            
            <motion.p 
              className="text-lg text-gray-600 mb-8 max-w-md mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              The page you're looking for seems to have wandered off. Let's get you back on track!
            </motion.p>
            
            {/* Action Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                <HomeIcon className="h-5 w-5 mr-2" />
                Go Home
              </Link>
              
              <Link
                href="/products"
                className="inline-flex items-center px-6 py-3 bg-white text-orange-600 font-semibold rounded-xl border-2 border-orange-600 hover:bg-orange-50 transform hover:scale-105 transition-all duration-300"
              >
                <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                Browse Products
              </Link>
              
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transform hover:scale-105 transition-all duration-300"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Go Back
              </button>
            </motion.div>
            
            {/* Popular Categories */}
            <motion.div 
              className="mt-12 pt-8 border-t border-gray-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Popular Categories
              </h3>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  { name: 'Kitchen', href: '/categories/kitchen' },
                  { name: 'Bedroom', href: '/categories/bedroom' },
                  { name: 'Bathroom', href: '/categories/bathroom' },
                  { name: 'Living Room', href: '/categories/living-room' }
                ].map((category) => (
                  <Link
                    key={category.name}
                    href={category.href}
                    className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors duration-300"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  )
}
