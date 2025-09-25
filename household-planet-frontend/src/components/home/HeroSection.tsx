'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

const heroVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8
    }
  }
};

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      delay: 0.4
    }
  }
};

const badgeVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      delay: 0.6
    }
  }
};

const householdImages = [
  {
    url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    mobileUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    fallback: '/images/banners/hero-banner-1.jpg',
    title: 'Modern Kitchen Essentials'
  },
  {
    url: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    mobileUrl: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    fallback: '/images/banners/hero-banner-1.jpg',
    title: 'Elegant Bathroom Solutions'
  },
  {
    url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    mobileUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    fallback: '/images/banners/hero-banner-1.jpg',
    title: 'Beautiful Home Decor'
  },
  {
    url: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    mobileUrl: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    fallback: '/images/banners/hero-banner-1.jpg',
    title: 'Cozy Living Spaces'
  },
  {
    url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    mobileUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    fallback: '/images/banners/hero-banner-1.jpg',
    title: 'Premium Cookware'
  }
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageErrors, setImageErrors] = useState<{[key: number]: boolean}>({});
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Preload mobile images
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      householdImages.forEach((image, index) => {
        const img = new Image();
        img.src = image.mobileUrl;
        img.onerror = () => {
          setImageErrors(prev => ({ ...prev, [index]: true }));
        };
      });
    }
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % householdImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % householdImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + householdImages.length) % householdImages.length);
  };

  return (
    <section className="hero-section relative h-[300px] sm:h-96 md:h-[500px] overflow-hidden bg-gradient-to-br from-green-50 to-orange-50">
      {/* Image Slideshow */}
      <div className="absolute inset-0">
        {householdImages.map((image, index) => {
          const imageUrl = imageErrors[index] 
            ? image.fallback 
            : (isMobile ? image.mobileUrl : image.url);
          
          return (
            <motion.div
              key={index}
              className="absolute inset-0 mobile-hero-image"
              style={{ 
                backgroundImage: `url("${imageUrl}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'scroll',
                zIndex: index === currentSlide ? 1 : 0
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: index === currentSlide ? 1 : 0 }}
              transition={{ duration: 0.8 }}
            >
              <img 
                src={imageUrl}
                alt={image.title}
                style={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: 0,
                  pointerEvents: 'none'
                }}
                onError={() => {
                  setImageErrors(prev => ({ ...prev, [index]: true }));
                }}
              />
            </motion.div>
          );
        })}
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-300"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-300"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>
      
      {/* Modern Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/60" />
      
      {/* Floating Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-green-400/20 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-orange-400/20 rounded-full blur-xl animate-pulse delay-1000" />
      </div>
      
      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pt-8 sm:pt-0">
        <div className="text-center px-3 sm:px-4 max-w-4xl">
          <motion.div
            variants={badgeVariants}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6"
          >
            <span className="text-sm font-medium text-white">🏠 Kenya's #1 Household Store</span>
          </motion.div>
          
          <motion.h1 
            variants={heroVariants}
            initial="hidden"
            animate="visible"
            className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 leading-tight"
          >
            Household Planet <span className="text-green-400">Kenya</span>
          </motion.h1>
          
          <motion.p 
            variants={heroVariants}
            initial="hidden"
            animate="visible"
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 mb-6 sm:mb-8 leading-relaxed"
          >
            Transforming Your Home
          </motion.p>
          
          <motion.div
            variants={buttonVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center items-center"
          >
            <Link 
              href="/products" 
              className="group bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 sm:py-3 sm:px-7 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center"
            >
              Shop Now
              <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            
            <Link 
              href="/categories" 
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/30 text-white font-semibold py-3 px-6 sm:py-3 sm:px-7 rounded-full transition-all duration-300 transform hover:scale-105 text-sm sm:text-base w-full sm:w-auto justify-center flex items-center"
            >
              Browse Categories
            </Link>
          </motion.div>
          
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-6 sm:mt-12 grid grid-cols-3 gap-4 sm:gap-8 text-center"
          >
            <div>
              <div className="text-lg sm:text-2xl md:text-3xl font-bold text-white mb-1">10K+</div>
              <div className="text-green-400 font-medium text-xs sm:text-sm">Happy Customers</div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl md:text-3xl font-bold text-white mb-1">24/7</div>
              <div className="text-green-400 font-medium text-xs sm:text-sm">Support</div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl md:text-3xl font-bold text-white mb-1">100+</div>
              <div className="text-green-400 font-medium text-xs sm:text-sm">Delivery</div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2 sm:space-x-3">
        {householdImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-white shadow-lg' : 'bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </section>
  );
}