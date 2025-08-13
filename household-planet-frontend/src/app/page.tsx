import { Metadata } from 'next';
import HeroSection from '@/components/sections/HeroSection';
import CategoriesCarousel from '@/components/sections/CategoriesCarousel';
import BestSellers from '@/components/sections/BestSellers';
import NewArrivals from '@/components/sections/NewArrivals';
import Testimonials from '@/components/sections/Testimonials';
import Newsletter from '@/components/sections/Newsletter';
import ValuePropositions from '@/components/sections/ValuePropositions';
import SocialMedia from '@/components/sections/SocialMedia';
import Footer from '@/components/sections/Footer';

export const metadata: Metadata = {
  title: 'Household Planet Kenya - Premium Home Essentials Delivered',
  description: 'Shop premium household essentials across Kenya. Quality products, fast delivery, and exceptional service for your home. Free delivery in Nairobi, Mombasa, and major cities.',
  keywords: 'household items Kenya, home essentials, kitchen appliances, cleaning supplies, home decor, furniture Kenya, online shopping Kenya',
  openGraph: {
    title: 'Household Planet Kenya - Premium Home Essentials',
    description: 'Transform your home with quality household essentials delivered across Kenya',
    images: ['/og-image.jpg'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Household Planet Kenya - Premium Home Essentials',
    description: 'Quality household items delivered across Kenya',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Household Planet Kenya',
            url: 'https://householdplanet.co.ke',
            description: 'Premium household essentials delivered across Kenya',
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://householdplanet.co.ke/search?q={search_term_string}',
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />
      <main className="min-h-screen" role="main">
        <HeroSection />
        <CategoriesCarousel />
        <BestSellers />
        <NewArrivals />
        <ValuePropositions />
        <Testimonials />
        <Newsletter />
        <SocialMedia />
        <Footer />
      </main>
    </>
  );
}