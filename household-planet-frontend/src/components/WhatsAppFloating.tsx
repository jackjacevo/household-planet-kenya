'use client';

import { useState, useEffect } from 'react';
import { FaWhatsapp, FaTimes, FaClock, FaHeadset } from 'react-icons/fa';

interface BusinessHours {
  isOpen: boolean;
  nextOpenTime?: string;
}

export default function WhatsAppFloating() {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [businessStatus, setBusinessStatus] = useState<BusinessHours | null>(null);
  const [contactInfo, setContactInfo] = useState<{
    whatsappNumber: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    // Load contact info and business status
    loadContactInfo();
    loadBusinessStatus();

    // Show after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
      // Show tooltip for 5 seconds
      setTimeout(() => setShowTooltip(true), 500);
      setTimeout(() => setShowTooltip(false), 5500);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const loadContactInfo = async () => {
    try {
      const response = await fetch('/api/whatsapp/contact-info');
      if (response.ok) {
        const data = await response.json();
        setContactInfo({
          whatsappNumber: data.whatsappNumber,
          message: data.message
        });
      }
    } catch (error) {
      console.error('Failed to load contact info:', error);
      // Fallback
      setContactInfo({
        whatsappNumber: '+254700000000',
        message: 'Hello! I\'m interested in your products from Household Planet Kenya.'
      });
    }
  };

  const loadBusinessStatus = async () => {
    try {
      const response = await fetch('/api/whatsapp/business/hours/status');
      if (response.ok) {
        const data = await response.json();
        setBusinessStatus(data);
      }
    } catch (error) {
      console.error('Failed to load business status:', error);
      setBusinessStatus({ isOpen: true }); // Default to open
    }
  };

  const handleWhatsAppClick = async () => {
    if (!contactInfo) return;

    // Track the click
    try {
      await fetch('/api/whatsapp/quick-inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: contactInfo.whatsappNumber,
          message: 'Customer clicked floating WhatsApp button'
        }),
      });
    } catch (error) {
      console.error('Failed to track WhatsApp click:', error);
    }

    // Open WhatsApp
    const message = encodeURIComponent(contactInfo.message);
    const phoneNumber = contactInfo.whatsappNumber.replace('+', '');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const handleClose = () => {
    setIsVisible(false);
    // Remember user preference
    localStorage.setItem('whatsapp-floating-closed', 'true');
  };

  // Don't show if user previously closed it
  if (localStorage.getItem('whatsapp-floating-closed') === 'true') {
    return null;
  }

  if (!isVisible || !contactInfo) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Enhanced Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-lg p-4 mb-2 max-w-sm animate-bounce">
          <div className="flex items-center mb-2">
            <FaHeadset className="text-green-600 mr-2" />
            <div className="text-sm text-gray-800 font-medium">
              Need help? Chat with us!
            </div>
          </div>
          
          <div className="text-xs text-gray-600 mb-2">
            Get instant support for:
          </div>
          
          <ul className="text-xs text-gray-600 space-y-1 mb-3">
            <li>• Product inquiries</li>
            <li>• Order tracking</li>
            <li>• Delivery information</li>
            <li>• Payment assistance</li>
          </ul>

          {businessStatus && (
            <div className="flex items-center text-xs">
              <FaClock className="mr-1" />
              <span className={businessStatus.isOpen ? 'text-green-600' : 'text-orange-600'}>
                {businessStatus.isOpen ? 'We\'re online now!' : 'We\'ll respond during business hours'}
              </span>
            </div>
          )}
          
          <div className="absolute -bottom-2 right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
        </div>
      )}

      {/* WhatsApp Button */}
      <div className="relative">
        <button
          onClick={handleWhatsAppClick}
          className={`text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 ${
            businessStatus?.isOpen 
              ? 'bg-green-500 hover:bg-green-600 animate-pulse' 
              : 'bg-green-600 hover:bg-green-700'
          }`}
          title={businessStatus?.isOpen ? 'Chat with us now - We\'re online!' : 'Send us a message - We\'ll respond soon!'}
        >
          <FaWhatsapp className="text-2xl" />
        </button>

        {/* Online indicator */}
        {businessStatus?.isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse">
            <div className="w-full h-full bg-green-500 rounded-full animate-ping"></div>
          </div>
        )}

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

      {/* Message count badge (if there are unread messages) */}
      <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold opacity-0">
        1
      </div>
    </div>
  );
}