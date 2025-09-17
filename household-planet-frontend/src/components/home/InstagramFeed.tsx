'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Instagram, Heart, MessageCircle, ExternalLink } from 'lucide-react';

const instagramPosts = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    caption: 'Transform your bedroom with our premium bedding collection! ✨',
    likes: 245,
    comments: 18
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    caption: 'Luxury bathroom accessories that make every day feel special 🛁',
    likes: 189,
    comments: 12
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    caption: 'Kitchen essentials that make cooking a joy! 👨‍🍳',
    likes: 312,
    comments: 25
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    caption: 'Home decor that speaks to your style 🏡',
    likes: 156,
    comments: 9
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    caption: 'Smart storage solutions for organized living 📦',
    likes: 203,
    comments: 15
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    caption: 'Professional cleaning supplies for a spotless home ✨',
    likes: 178,
    comments: 11
  },
  {
    id: 7,
    image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    caption: 'Cozy living room essentials for family time 🛋️',
    likes: 267,
    comments: 22
  },
  {
    id: 8,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    caption: 'Elegant dining sets for memorable meals 🍽️',
    likes: 194,
    comments: 16
  },
  {
    id: 9,
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    caption: 'Modern appliances for efficient living ⚡',
    likes: 231,
    comments: 19
  },
  {
    id: 10,
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    caption: 'Garden tools for your outdoor paradise 🌱',
    likes: 142,
    comments: 8
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6
    }
  }
};

export function InstagramFeed() {
  return (
    <section className="py-12 bg-gradient-to-br from-pink-50 via-white to-purple-50/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 right-10 w-20 h-20 bg-pink-200/20 rounded-full blur-xl" />
        <div className="absolute bottom-10 left-10 w-24 h-24 bg-purple-200/20 rounded-full blur-2xl" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Instagram className="w-4 h-4" />
            Follow Us
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Follow Us on <span className="text-pink-600">Instagram</span>
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto mb-4">
            See our products in real homes and get daily inspiration!
          </p>
          
          <Link 
            href="https://instagram.com/householdplanetkenya" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="group inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Instagram className="w-5 h-5" />
            @householdplanetkenya
            <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
        
        {/* Instagram Grid - Compact 6 small images */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-10 gap-1 max-w-full mx-auto"
        >
          {instagramPosts.map((post, index) => (
            <motion.div key={post.id} variants={itemVariants}>
              <Link 
                href="https://instagram.com/householdplanetkenya" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group block bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                {/* Image */}
                <div className="relative overflow-hidden aspect-square">
                  <img 
                    src={post.image} 
                    alt={`Instagram post ${post.id}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center" >
                    <Instagram className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-8"
        >
          <p className="text-gray-600 mb-3">
            Tag us for a chance to be featured!
          </p>
          <div className="inline-flex items-center gap-2 text-sm text-gray-500">
            <span className="font-medium">#HouseholdPlanetKenya</span>
            <span>•</span>
            <span className="font-medium">#KenyanHomes</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
