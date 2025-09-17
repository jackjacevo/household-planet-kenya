'use client';

import Link from 'next/link';

export function PromoBanner() {
  return (
    <section className="py-8 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="bg-green-600 rounded-lg overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Free Delivery in Nairobi CBD
              </h2>
              <p className="text-green-100 mb-6">
                Enjoy free delivery on all orders above KSh 5,000 within Nairobi CBD
              </p>
              <Link 
                href="/products" 
                className="inline-block bg-white text-green-600 font-medium py-2 px-6 rounded-full transition duration-300 hover:bg-gray-100"
              >
                Shop Now
              </Link>
            </div>
            <div className="md:w-1/2 hidden md:block">
              <img 
                src="https://images.unsplash.com/photo-1556911220-bff31c812dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                alt="Delivery" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
