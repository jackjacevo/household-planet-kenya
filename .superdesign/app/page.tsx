import { HeroSection } from '@/components/hero-section'
import { FeaturedProducts } from '@/components/featured-products'
import { CategoriesSection } from '@/components/categories-section'
import { NewsletterSection } from '@/components/newsletter-section'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <FeaturedProducts />
        <CategoriesSection />
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  )
}