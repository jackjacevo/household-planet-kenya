'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, Zap, ArrowRight, Percent } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function FlashSale() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 2,
    hours: 14,
    minutes: 30,
    seconds: 45
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-20 bg-gradient-to-br from-red-600 via-red-500 to-orange-500 text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      </div>
      
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 animate-bounce delay-300">
          <Percent className="w-8 h-8" />
        </div>
        <div className="absolute top-40 right-32 animate-bounce delay-700">
          <Zap className="w-6 h-6" />
        </div>
        <div className="absolute bottom-32 left-40 animate-bounce delay-500">
          <Percent className="w-10 h-10" />
        </div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:w-1/2 text-center lg:text-left"
          >
            {/* Flash Sale Badge */}
            <div className="inline-flex items-center gap-2 bg-yellow-400 text-red-800 px-4 py-2 rounded-full text-sm font-bold mb-6 animate-pulse">
              <Zap className="w-4 h-4" />
              FLASH SALE
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="block">Up to</span>
              <span className="block text-yellow-300 text-6xl md:text-7xl lg:text-8xl">50% OFF</span>
              <span className="block text-2xl md:text-3xl font-medium">Home Essentials</span>
            </h2>
            
            <p className="text-xl mb-8 text-red-100 leading-relaxed">
              Transform your home with our premium products at unbeatable prices. 
              <span className="font-semibold text-yellow-300"> Limited time offer!</span>
            </p>
            
            {/* Countdown Timer */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4 justify-center lg:justify-start">
                <Clock className="w-5 h-5 text-yellow-300" />
                <span className="text-lg font-semibold">Sale ends in:</span>
              </div>
              
              <div className="grid grid-cols-4 gap-4 max-w-md mx-auto lg:mx-0">
                {[
                  { label: 'Days', value: timeLeft.days },
                  { label: 'Hours', value: timeLeft.hours },
                  { label: 'Minutes', value: timeLeft.minutes },
                  { label: 'Seconds', value: timeLeft.seconds }
                ].map((item, index) => (
                  <div key={item.label} className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl md:text-3xl font-bold text-yellow-300">
                      {item.value.toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs text-red-100 font-medium">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link 
                href="/products" 
                className="group bg-white hover:bg-yellow-50 text-red-600 py-4 px-8 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center justify-center gap-2"
              >
                Shop Sale Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link 
                href="/products" 
                className="group border-2 border-white/50 hover:border-white text-white hover:bg-white/10 py-4 px-8 rounded-full font-semibold text-lg transition-all duration-300"
              >
                View All Deals
              </Link>
            </div>
          </motion.div>
          
          {/* Image */}
          <motion.div 
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:w-1/2 relative"
          >
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1632&q=80" 
                alt="Flash Sale - Home Essentials" 
                className="rounded-2xl shadow-2xl w-full h-auto transform hover:scale-105 transition-transform duration-500"
              />
              
              {/* Floating Discount Badge */}
              <div className="absolute -top-4 -right-4 bg-yellow-400 text-red-800 rounded-full w-20 h-20 flex items-center justify-center font-bold text-lg shadow-2xl animate-bounce">
                50%<br/>OFF
              </div>
              
              {/* Glow Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400/20 to-red-400/20 blur-xl -z-10" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}