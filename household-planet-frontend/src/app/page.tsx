'use client';

import { motion } from 'framer-motion';
import { HeroSection } from '@/components/home/HeroSection'
import { FeaturedCategories } from '@/components/home/FeaturedCategories'
import { BestSellers } from '@/components/home/BestSellers'
import { NewArrivals } from '@/components/home/NewArrivals'
import { PopularItems } from '@/components/home/PopularItems'
import { Testimonials } from '@/components/home/Testimonials'
import { NewsletterSignup } from '@/components/home/NewsletterSignup'
import { InstagramFeed } from '@/components/home/InstagramFeed'
import { StoreLocation } from '@/components/home/StoreLocation'
import { TrustBadges } from '@/components/home/TrustBadges'
import { ValuePropositions } from '@/components/home/ValuePropositions'
import { RecentlyViewed } from '@/components/products/RecentlyViewed'
import { SEOHead } from '@/components/seo/SEOHead'
import { InternalLinks } from '@/components/seo/InternalLinks'
import { SocialMediaIcons } from '@/components/layout/SocialMediaIcons'
import { generateOrganizationSchema, generateWebsiteSchema } from '@/lib/seo'
import { getHomepageLinks } from '@/lib/internal-links'

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
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
      
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30 overflow-hidden">
        {/* Sticky Social Media Icons */}
        <SocialMediaIcons />
        
        {/* Dynamic Hero Banner */}
        <HeroSection />
        
        {/* Value Propositions - Why Choose Us */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={sectionVariants}
          className="px-4 sm:px-0"
        >
          <ValuePropositions />
        </motion.div>
      
      {/* Featured Categories with enhanced hover effects */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={sectionVariants}
        className="px-4 sm:px-0"
      >
        <FeaturedCategories />
      </motion.div>
      

      {/* Best Sellers */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={sectionVariants}
      >
        <BestSellers />
      </motion.div>
      
      {/* New Arrivals */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={sectionVariants}
      >
        <NewArrivals />
      </motion.div>
      
      {/* Popular Items */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={sectionVariants}
      >
        <PopularItems />
      </motion.div>
      
      {/* Recently Viewed */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={sectionVariants}
      >
        <RecentlyViewed />
      </motion.div>
      
      {/* Trust Badges - Build confidence */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={sectionVariants}
      >
        <TrustBadges />
      </motion.div>
      
      {/* Testimonials with enhanced design */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={sectionVariants}
      >
        <Testimonials />
      </motion.div>
      
      {/* Newsletter Signup with discount incentives */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={sectionVariants}
      >
        <NewsletterSignup />
      </motion.div>

      {/* Instagram Feed */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={sectionVariants}
        className="mb-16"
      >
        <InstagramFeed />
      </motion.div>
      
      {/* Internal Links for SEO */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={sectionVariants}
        className="px-4 py-16"
      >
        <div className="container mx-auto max-w-7xl">
          <InternalLinks
            title="Explore More"
            links={getHomepageLinks()}
          />
        </div>
      </motion.div>
      
        {/* Store Location - Find Us */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={sectionVariants}
          className="pb-16"
        >
          <StoreLocation />
        </motion.div>
      </main>
    </>
  )
}
