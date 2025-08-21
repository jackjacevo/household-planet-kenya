'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Shield, Truck } from 'lucide-react';

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

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video/Image with Enhanced Overlay */}
      <div className="absolute inset-0">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
          }}
        />
        
        {/* Optional: Video Background (uncomment when video is available) */}
        {/* <video 
          autoPlay 
          muted 
          loop 
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/videos/home-transformation.mp4" type="video/mp4" />
        </video> */}
      </div>
      
      {/* Modern Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-green-900/30" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-green-400/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-orange-400/10 rounded-full blur-xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-blue-400/10 rounded-full blur-xl animate-pulse delay-500" />
      </div>
      
      {/* Content - Balanced Layout */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white text-center lg:text-left">
            {/* Trust Badge */}
            <motion.div
              variants={badgeVariants}
              initial="hidden"
              animate="visible"
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6"
            >
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium">Trusted by 10,000+ Kenyan Families</span>
            </motion.div>
            
            {/* Main Heading */}
            <motion.div
              variants={heroVariants}
              initial="hidden"
              animate="visible"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                <span className="block text-yellow-300 text-2xl md:text-3xl font-medium mb-2 animate-pulse">
                  🏠 Transforming Your Home
                </span>
                <span className="block">Welcome to</span>
                <span className="block bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                  Household Planet Kenya
                </span>
              </h1>
              
              <p className="text-lg md:text-xl mb-8 text-gray-200 leading-relaxed">
                Quality household items, kitchen appliances & home decor with 
                <span className="text-green-300 font-semibold"> FREE delivery</span> across Kenya. 
                Transform your living spaces today!
              </p>
              
              {/* Contact Information */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6 text-sm text-gray-300">
                <a href="tel:+254790227760" className="flex items-center gap-2 hover:text-green-300 transition-colors">
                  📞 +254 790 227 760
                </a>
                <a href="mailto:householdplanet819@gmail.com" className="flex items-center gap-2 hover:text-green-300 transition-colors">
                  ✉️ householdplanet819@gmail.com
                </a>
              </div>
            </motion.div>
            
            {/* CTA Buttons */}
            <motion.div
              variants={buttonVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col sm:flex-row gap-4 mb-8 justify-center lg:justify-start"
            >
              <Link 
                href="/products" 
                className="group bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white py-4 px-8 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center justify-center gap-2"
              >
                Shop Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link 
                href="/categories" 
                className="group bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/30 hover:border-white/50 text-white py-4 px-8 rounded-full font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Explore Collections
              </Link>
            </motion.div>
          </div>
          
          {/* Right Content - Features Grid */}
          <div className="lg:pl-8">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {/* Member Rewards */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-green-400 font-semibold mb-2">Member Rewards</div>
                <div className="text-sm text-gray-200">Exclusive discounts</div>
              </div>
              
              {/* Early Access */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-green-400 font-semibold mb-2">Early Access</div>
                <div className="text-sm text-gray-200">New arrivals first</div>
              </div>
              
              {/* Free Delivery */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-green-400 font-semibold mb-2">🚚 Free Delivery</div>
                <div className="text-sm text-gray-200">Orders over Ksh 2,000</div>
              </div>
              
              {/* Quality Guarantee */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-green-400 font-semibold mb-2">🛡️ Quality Guarantee</div>
                <div className="text-sm text-gray-200">100% Authentic Products</div>
              </div>
            </motion.div>
            
            {/* Enhanced Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-8 text-center lg:text-left"
            >
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-2xl font-bold text-white mb-1">10,000+</div>
                  <div className="text-green-400 font-medium text-sm">Happy Customers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white mb-1">24/7</div>
                  <div className="text-green-400 font-medium text-sm">Customer Service</div>
                </div>
              </div>
              <div className="text-green-400 font-medium">🏆 Kenya's #1 Household Store</div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-bounce" />
        </div>
      </motion.div>
    </section>
  );
}
