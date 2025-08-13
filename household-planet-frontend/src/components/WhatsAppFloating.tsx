'use client';

import { useState, useEffect } from 'react';
import { FaWhatsapp, FaTimes } from 'react-icons/fa';

export default function WhatsAppFloating() {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Show after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
      // Show tooltip for 5 seconds
      setTimeout(() => setShowTooltip(true), 500);
      setTimeout(() => setShowTooltip(false), 5500);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('Hello! I\'m interested in your products from Household Planet Kenya.');
    const phoneNumber = '254700000000'; // Replace with actual business number
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-lg p-3 mb-2 max-w-xs animate-bounce">
          <div className="text-sm text-gray-800 font-medium">
            Need help? Chat with us!
          </div>
          <div className="text-xs text-gray-600 mt-1">
            We're here to assist you 24/7
          </div>
          <div className="absolute -bottom-2 right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
        </div>
      )}

      {/* WhatsApp Button */}
      <div className="relative">
        <button
          onClick={handleWhatsAppClick}
          className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 animate-pulse"
          title="Chat with us on WhatsApp"
        >
          <FaWhatsapp className="text-2xl" />
        </button>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute -top-2 -right-2 bg-gray-500 hover:bg-gray-600 text-white rounded-full p-1 text-xs opacity-70 hover:opacity-100 transition-opacity"
          title="Close"
        >
          <FaTimes className="text-xs" />
        </button>

        {/* Ripple effect */}
        <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-20"></div>
      </div>
    </div>
  );
}