'use client';

import { motion } from 'framer-motion';
import { Star, Quote, Users, ThumbsUp } from 'lucide-react';

// Sample testimonials with real-looking data
const testimonials = [
  {
    id: 1,
    name: 'Sarah Wanjiku',
    location: 'Nairobi, Kenya',
    rating: 5,
    comment: 'Amazing quality kitchen utensils! The delivery was super fast and the customer service was excellent. My cooking experience has completely transformed.',
    product: 'Premium Kitchen Set',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    verified: true
  },
  {
    id: 2,
    name: 'James Mwangi',
    location: 'Mombasa, Kenya',
    rating: 5,
    comment: 'The bathroom accessories I ordered exceeded my expectations. Great value for money and the WhatsApp support made ordering so easy!',
    product: 'Luxury Bathroom Set',
    avatar: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    verified: true
  },
  {
    id: 3,
    name: 'Grace Akinyi',
    location: 'Kisumu, Kenya',
    rating: 5,
    comment: 'Love my new bedding set! The quality is outstanding and it arrived exactly as described. Household Planet is now my go-to store.',
    product: 'Cotton Bedding Collection',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    verified: true
  }
];

const stats = [
  { icon: Users, value: '10,000+', label: 'Happy Customers' },
  { icon: Star, value: '4.9/5', label: 'Average Rating' },
  { icon: ThumbsUp, value: '98%', label: 'Satisfaction Rate' }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6
    }
  }
};

export function Testimonials() {
  return (
    <section className="py-8 sm:py-12 bg-white">
      <div className="container mx-auto px-3 sm:px-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center mb-6 sm:mb-8">What Our Customers Say</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-gray-50 rounded-lg p-4 sm:p-6 shadow-sm">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">"{testimonial.comment}"</p>
              <div className="flex items-center">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name} 
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-3"
                />
                <div>
                  <h4 className="font-medium text-gray-900 text-sm sm:text-base">{testimonial.name}</h4>
                  <p className="text-xs sm:text-sm text-gray-500">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}