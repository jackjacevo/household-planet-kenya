'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { FaWhatsapp, FaFacebook, FaInstagram, FaTwitter, FaCamera } from 'react-icons/fa';
import { FiInstagram } from 'react-icons/fi';

const IconComponent = ({ iconName }: { iconName: string }) => {
  const icons = {
    FaWhatsapp,
    FaFacebook, 
    FaInstagram,
    FaTwitter
  };
  const Icon = icons[iconName as keyof typeof icons];
  return Icon ? <Icon className="text-xl" /> : null;
};

const socialPosts = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    caption: 'Transform your living room with our premium furniture collection! ✨ #HomeDecor #InteriorDesign',
    likes: 234,
    comments: 18
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    caption: 'Cooking made easy with our non-stick cookware set! Perfect for every Kenyan kitchen 👨‍🍳 #Cooking #Kitchen',
    likes: 189,
    comments: 12
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    caption: 'Sweet dreams start with quality bedding! Our luxury collection is now available 😴 #Bedding #Sleep',
    likes: 156,
    comments: 8
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    caption: 'Create your own green oasis with our garden essentials! 🌿 #Gardening #Plants #HomeGarden',
    likes: 203,
    comments: 15
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    caption: 'Brighten up your space with our modern LED lighting solutions! ⚡ #Lighting #ModernHome',
    likes: 178,
    comments: 9
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    caption: 'Keep your home spotless with our professional cleaning supplies! 🧹 #Cleaning #Homecare',
    likes: 145,
    comments: 6
  }
];

const StickyIcons = () => {
  const socialLinks = [
    { name: 'WhatsApp', icon: 'FaWhatsapp', color: 'bg-green-500', link: 'https://wa.me/254790227760' },
    { name: 'Facebook', icon: 'FaFacebook', color: 'bg-blue-600', link: '#' },
    { name: 'Instagram', icon: 'FaInstagram', color: 'bg-pink-500', link: '#' },
    { name: 'Twitter', icon: 'FaTwitter', color: 'bg-blue-400', link: '#' }
  ];

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 space-y-3">
      {socialLinks.map((social, index) => (
        <motion.a
          key={social.name}
          href={social.link}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`flex items-center justify-center w-12 h-12 ${social.color} text-white rounded-full shadow-lg hover:shadow-xl transition-all`}
          title={social.name}
        >
          <IconComponent iconName={social.icon} />
        </motion.a>
      ))}
    </div>
  );
};

export default function SocialMedia() {
  const [hoveredPost, setHoveredPost] = useState<number | null>(null);

  return (
    <>
      <StickyIcons />
      
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Follow Us on Instagram
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Get inspired by our latest home transformations and product showcases
            </p>
            <div className="mt-4">
              <span className="text-blue-600 font-semibold">@householdplanetkenya</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {socialPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onMouseEnter={() => setHoveredPost(post.id)}
                onMouseLeave={() => setHoveredPost(null)}
                className="relative aspect-square bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl overflow-hidden cursor-pointer group"
              >
                <img src={post.image} alt={`Social post ${post.id}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                
                {hoveredPost === post.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-black bg-opacity-75 flex flex-col justify-end p-4 text-white"
                  >
                    <p className="text-xs mb-2 line-clamp-3">{post.caption}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span>❤️ {post.likes}</span>
                      <span>💬 {post.comments}</span>
                    </div>
                  </motion.div>
                )}
                
                <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-full p-1">
                  <span className="text-xs">📷</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <motion.a
              href="#"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-full hover:shadow-lg transition-all"
            >
              <FiInstagram className="mr-2 h-5 w-5" />
              Follow @householdplanetkenya
            </motion.a>
          </div>
        </div>
      </section>
    </>
  );
}