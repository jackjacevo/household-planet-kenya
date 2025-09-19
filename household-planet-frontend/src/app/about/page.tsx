'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { CheckCircle, Truck, Shield, Heart, MapPin, Phone, Mail, Star, Users, Award, Clock } from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function AboutPage() {
  const stats = [
    { icon: Users, value: '10,000+', label: 'Happy Customers' },
    { icon: Award, value: '5+', label: 'Years Experience' },
    { icon: Star, value: '4.9', label: 'Customer Rating' },
    { icon: Clock, value: '24/7', label: 'Customer Support' }
  ];

  const values = [
    {
      icon: CheckCircle,
      title: 'Quality Products',
      description: 'Every item is carefully selected for quality and durability',
      gradient: 'from-emerald-400 to-teal-600'
    },
    {
      icon: Truck,
      title: 'Countrywide Delivery',
      description: 'Fast and reliable delivery across all counties in Kenya',
      gradient: 'from-blue-400 to-indigo-600'
    },
    {
      icon: Shield,
      title: 'Secure Shopping',
      description: 'Safe and secure payment options including M-Pesa',
      gradient: 'from-purple-400 to-pink-600'
    },
    {
      icon: Heart,
      title: 'Customer Care',
      description: 'Dedicated support team ready to assist you',
      gradient: 'from-red-400 to-rose-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-20 px-3 sm:px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-amber-600/10" />
        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1 
              className="text-3xl sm:text-5xl md:text-7xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-4 sm:mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              About Us
            </motion.h1>
            <motion.p 
              className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Transforming Your Home, One Product at a Time
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 sm:py-16 px-3 sm:px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="text-center group"
                >
                  <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                    <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 mx-auto mb-3 sm:mb-4" />
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">{stat.value}</div>
                    <div className="text-gray-600 text-xs sm:text-sm">{stat.label}</div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                Our <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Story</span>
              </h2>
              <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
                <p>
                  Founded with a simple vision - to make quality home products accessible to every Kenyan household, 
                  Household Planet Kenya has grown from a small local shop to a trusted name in home transformation.
                </p>
                <p>
                  Located in the heart of Nairobi at Iconic Business Plaza, Moi Avenue, we've been serving our 
                  community with dedication and passion since our inception. Our journey is built on the foundation 
                  of quality, affordability, and exceptional customer service.
                </p>
                <p>
                  Every product we offer is carefully selected to ensure it meets our high standards and helps 
                  transform your house into a home you'll love.
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="relative h-96 rounded-3xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-orange-600/20 to-amber-600/20 z-10" />
                <Image
                  src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80"
                  alt="Modern kitchen with household products"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-r from-orange-600 to-amber-600 rounded-full opacity-20" />
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-20" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 bg-white/50">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Us</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're committed to providing exceptional value through quality products and outstanding service
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="group cursor-pointer"
                >
                  <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-3 border border-gray-100">
                    <div className={`bg-gradient-to-r ${value.gradient} rounded-2xl p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-orange-600 transition-colors">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Visit Our <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Store</span>
            </h2>
            <p className="text-xl text-gray-600">
              Experience our products firsthand at our Nairobi location
            </p>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-br from-white to-orange-50 rounded-3xl p-8 md:p-12 shadow-2xl border border-orange-100"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Household Planet Kenya</h3>
              <div className="w-24 h-1 bg-gradient-to-r from-orange-600 to-amber-600 mx-auto rounded-full" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Location</h4>
                <p className="text-gray-600 leading-relaxed">
                  Iconic Business Plaza<br />
                  Basement Shop B10<br />
                  Moi Avenue, Nairobi
                </p>
              </div>

              <div className="text-center group">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Phone className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Phone/WhatsApp</h4>
                <p className="text-gray-600">
                  <a href="tel:+254790227760" className="hover:text-orange-600 transition-colors">
                    +254 790 227 760
                  </a>
                </p>
              </div>

              <div className="text-center group">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Email</h4>
                <p className="text-gray-600">
                  <a href="mailto:householdplanet819@gmail.com" className="hover:text-orange-600 transition-colors">
                    householdplanet819@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
