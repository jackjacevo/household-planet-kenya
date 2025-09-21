'use client';

import { motion } from 'framer-motion';
import { HeroSection } from '@/components/home/HeroSection'
import { FeaturedCategories } from '@/components/home/FeaturedCategories'
import { BestSellers } from '@/components/home/BestSellers'
import { NewArrivals } from '@/components/home/NewArrivals'
import { InstagramFeed } from '@/components/home/InstagramFeed'
import { StoreLocation } from '@/components/home/StoreLocation'
import { TrustBadges } from '@/components/home/TrustBadges'
import { RecentlyViewed } from '@/components/home/RecentlyViewed'
import SEOHead from '@/components/SEO/SEOHead'
import { InternalLinks } from '@/components/SEO/InternalLinks'
import { SocialMediaIcons } from '@/components/layout/SocialMediaIcons'
import { generateOrganizationSchema, generateWebsiteSchema } from '@/lib/seo'
import { getHomepageLinks } from '@/lib/internal-links'

// Import test utility in development
if (process.env.NODE_ENV === 'development') {
  import('@/lib/addTestRecentlyViewed');
}

// Force deployment refresh

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

export default function HomePage() {
  const structuredData = [
    generateOrganizationSchema(),
    generateWebsiteSchema(),
    {
      '@context': 'https://schema.org',
      '@type': 'Store',
      name: 'Household Planet Kenya',
      description: 'Quality household items, kitchen appliances, home decor, and more with fast delivery across Kenya',
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://householdplanet.co.ke',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Nairobi',
        addressCountry: 'KE'
      },
      priceRange: 'KES 100 - KES 100,000',
      paymentAccepted: ['Cash', 'M-Pesa', 'Credit Card'],
      currenciesAccepted: 'KES'
    }
  ]

  return (
    <>
      <SEOHead
        title="Quality Home Products & Appliances - Fast Delivery Kenya"
        description="Shop quality household items, kitchen appliances, home decor, and more at Household Planet Kenya. Fast delivery across Kenya with secure M-Pesa payments."
        keywords={[
          'household items Kenya',
          'kitchen appliances Nairobi',
          'home products Kenya',
          'online shopping Kenya',
          'M-Pesa payments',
          'fast delivery Kenya',
          'quality home goods',
          'household planet'
        ]}
        url="/"
        type="website"
        structuredData={structuredData}
      />
      
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/20">
        {/* Sticky Social Media Icons */}
        <SocialMediaIcons />
        
        {/* Hero Section */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
        >
          <HeroSection />
        </motion.section>
        
        {/* Categories Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
          className="py-8"
        >
          <FeaturedCategories />
        </motion.section>
        
        {/* Featured Products */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
          className="py-8"
        >
          <BestSellers />
        </motion.section>
      
        {/* New Arrivals */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
          className="py-8"
        >
          <NewArrivals />
        </motion.section>
        
        {/* Recently Viewed */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
          className="py-8"
        >
          <RecentlyViewed />
        </motion.section>
        
        {/* Trust Badges */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
          className="py-8"
        >
          <TrustBadges />
        </motion.section>
        
        {/* Instagram Feed */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
          className="py-8"
        >
          <InstagramFeed />
        </motion.section>
        
        {/* Internal Links */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
          className="py-16 px-4"
        >
          <div className="container mx-auto max-w-7xl">
            <InternalLinks
              title="Explore More"
              links={getHomepageLinks()}
            />
          </div>
        </motion.section>
        
        {/* Store Location */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
          className="pb-16"
        >
          <StoreLocation />
        </motion.section>
      </main>
    </>
  )
}
