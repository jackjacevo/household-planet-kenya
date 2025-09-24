'use client';

import { motion, type Variants } from 'framer-motion';
import { HeroSection } from '@/components/home/HeroSection'
import { CategoriesSection } from '@/components/home/CategoriesSection'

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



const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" }
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
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://householdplanetkenya.co.ke',
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
      
      <main className="min-h-screen bg-white w-full overflow-x-hidden">
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
          viewport={{ once: true, margin: "-50px" }}
          variants={sectionVariants}
        >
          <CategoriesSection />
        </motion.section>

        {/* Featured Products */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={sectionVariants}
          className="py-4 sm:py-8"
        >
          <BestSellers />
        </motion.section>
      
        {/* New Arrivals */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={sectionVariants}
          className="py-4 sm:py-8"
        >
          <NewArrivals />
        </motion.section>
        
        {/* Recently Viewed */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={sectionVariants}
          className="py-8"
        >
          <RecentlyViewed />
        </motion.section>
        
        {/* Trust Badges */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={sectionVariants}
          className="py-8"
        >
          <TrustBadges />
        </motion.section>
        
        {/* Instagram Feed */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={sectionVariants}
          className="py-8"
        >
          <InstagramFeed />
        </motion.section>
        
        {/* Internal Links */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={sectionVariants}
          className="py-8 sm:py-16 px-2 sm:px-4"
        >
          <div className="w-full max-w-7xl mx-auto">
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
          viewport={{ once: true, margin: "-50px" }}
          variants={sectionVariants}
          className="pb-16"
        >
          <StoreLocation />
        </motion.section>
      </main>
    </>
  )
}
