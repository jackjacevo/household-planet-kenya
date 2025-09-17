'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

import SEOHead from '@/components/seo/SEOHead';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { generateOrganizationSchema } from '@/lib/seo';
import { Phone, Mail, MapPin, Clock, MessageCircle, Headphones, Navigation, ShoppingCart, Truck, Package } from 'lucide-react';
import ContactMap from '@/components/ui/ContactMap';

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

export default function ContactPage() {
  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Us - Household Planet Kenya',
    description: 'Get in touch with Household Planet Kenya for customer support, product inquiries, and business partnerships.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/contact`
  }

  const structuredData = [generateOrganizationSchema(), contactSchema]



  const contactMethods = [
    {
      icon: MapPin,
      title: 'Visit Our Store',
      content: 'Iconic Business Plaza, Basement Shop B10\nMoi Avenue, Nairobi',
      gradient: 'from-red-500 to-pink-600',
      action: null
    },
    {
      icon: Phone,
      title: 'Call or WhatsApp',
      content: '+254 790 227 760',
      gradient: 'from-green-500 to-emerald-600',
      action: 'tel:+254790227760'
    },
    {
      icon: Mail,
      title: 'Email Us',
      content: 'householdplanet819@gmail.com',
      gradient: 'from-blue-500 to-indigo-600',
      action: 'mailto:householdplanet819@gmail.com'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      content: 'Mon-Sat: 8:00 AM - 6:00 PM\nSunday: 9:00 AM - 4:00 PM',
      gradient: 'from-purple-500 to-violet-600',
      action: null
    }
  ];



  return (
    <>
      <SEOHead
        title="Contact Us - Customer Support & Inquiries"
        description="Contact Household Planet Kenya for customer support, product inquiries, delivery questions, and business partnerships. We're here to help with all your household needs."
        keywords={[
          'contact household planet kenya',
          'customer support kenya',
          'product inquiries',
          'delivery questions',
          'business partnerships',
          'household products support'
        ]}
        url="/contact"
        type="website"
        structuredData={structuredData}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
        {/* Breadcrumbs */}
        <div className="px-4 pt-4">
          <div className="container mx-auto max-w-6xl">
            <Breadcrumbs
              items={[
                { name: 'Contact', url: '/contact' }
              ]}
            />
          </div>
        </div>
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
              Contact Us
            </motion.h1>
            <motion.p 
              className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              We're here to help! Get in touch with us for any questions or support
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-8 sm:py-16 px-3 sm:px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="group cursor-pointer"
                >
                  <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-3 border border-gray-100 h-full">
                    <div className={`bg-gradient-to-r ${method.gradient} rounded-2xl p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 text-center group-hover:text-orange-600 transition-colors">
                      {method.title}
                    </h3>
                    <div className="text-center">
                      {method.action ? (
                        <a 
                          href={method.action} 
                          className="text-gray-600 hover:text-orange-600 transition-colors text-sm leading-relaxed block"
                        >
                          {method.content.split('\n').map((line, i) => (
                            <span key={i} className="block">{line}</span>
                          ))}
                        </a>
                      ) : (
                        <div className="text-gray-600 text-sm leading-relaxed">
                          {method.content.split('\n').map((line, i) => (
                            <div key={i}>{line}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Let's <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Connect</span>
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed mb-8">
                  Have questions about our products or need help with your order? 
                  We're here to help! Our dedicated team is ready to assist you with any inquiries.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-3">
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Quick Response</h3>
                    <p className="text-gray-600 text-sm">We typically respond within 2 hours</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-3">
                    <Headphones className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Expert Support</h3>
                    <p className="text-gray-600 text-sm">Our team knows our products inside out</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* WhatsApp Contact */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="bg-gradient-to-br from-white to-green-50 rounded-3xl p-8 shadow-2xl border border-green-100">
                <div className="text-center mb-8">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                    <MessageCircle className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">Chat with us on WhatsApp</h3>
                  <p className="text-gray-600 mb-6">Get instant support and quick responses. Choose a template below or start a custom chat!</p>
                  <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-600 mx-auto rounded-full" />
                </div>

                <div className="space-y-4 mb-8">
                  {[
                    {
                      title: "🛍️ Product Inquiry",
                      message: "Hi! I'm interested in learning more about your household products. Could you please share your catalog and pricing?",
                      gradient: "from-blue-500 to-indigo-600",
                      iconType: "shopping"
                    },
                    {
                      title: "🚚 Delivery Information",
                      message: "Hello! I'd like to know about delivery options, costs, and timeframes for my area. Can you help me with this information?",
                      gradient: "from-purple-500 to-violet-600",
                      iconType: "truck"
                    },
                    {
                      title: "📦 Order Status",
                      message: "Hi! I'd like to check the status of my order. Could you please help me track my delivery?",
                      gradient: "from-orange-500 to-red-600",
                      iconType: "package"
                    },
                    {
                      title: "💡 General Support",
                      message: "Hello! I have a question about Household Planet Kenya. Could you please assist me?",
                      gradient: "from-teal-500 to-cyan-600",
                      iconType: "headphones"
                    }
                  ].map((template, index) => (
                    <motion.button
                      key={index}
                      onClick={() => {
                        const whatsappUrl = `https://wa.me/254790227760?text=${encodeURIComponent(template.message)}`;
                        window.open(whatsappUrl, '_blank');
                      }}
                      className="w-full p-4 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300 text-left group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`bg-gradient-to-r ${template.gradient} rounded-lg p-3 group-hover:scale-110 transition-transform duration-300`}>
                          {template.iconType === "shopping" && <ShoppingCart className="h-5 w-5 text-white" />}
                          {template.iconType === "truck" && <Truck className="h-5 w-5 text-white" />}
                          {template.iconType === "package" && <Package className="h-5 w-5 text-white" />}
                          {template.iconType === "headphones" && <Headphones className="h-5 w-5 text-white" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                            {template.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {template.message}
                          </p>
                        </div>
                        <div className="text-green-500 group-hover:translate-x-1 transition-transform duration-300">
                          <Navigation className="h-5 w-5" />
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <motion.button
                    onClick={() => {
                      const whatsappUrl = `https://wa.me/254790227760`;
                      window.open(whatsappUrl, '_blank');
                    }}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-3"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <MessageCircle className="h-6 w-6" />
                    <span>Start Custom Chat</span>
                    <div className="bg-white/20 rounded-full px-3 py-1 text-sm">
                      +254 790 227 760
                    </div>
                  </motion.button>
                  
                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-500">
                      💬 Available Mon-Sat: 8AM-6PM | Sun: 9AM-4PM
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Google Map Section */}
      <ContactMap />
      </div>
    </>
  );
}
