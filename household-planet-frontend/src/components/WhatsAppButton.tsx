'use client';

import { useState, useEffect } from 'react';
import { FaWhatsapp } from 'react-icons/fa';

interface WhatsAppButtonProps {
  productName?: string;
  productUrl?: string;
  customMessage?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'floating' | 'inline';
}

export default function WhatsAppButton({
  productName,
  productUrl,
  customMessage,
  className = '',
  size = 'md',
  variant = 'inline'
}: WhatsAppButtonProps) {
  const [contactInfo, setContactInfo] = useState<{
    whatsappNumber: string;
    message: string;
    link: string;
  } | null>(null);

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      const response = await fetch('/api/whatsapp/contact-info');
      const data = await response.json();
      setContactInfo(data);
    } catch (error) {
      console.error('Failed to fetch WhatsApp contact info:', error);
      // Fallback
      setContactInfo({
        whatsappNumber: '+254700000000',
        message: 'Hello! I\'m interested in your products.',
        link: 'https://wa.me/254700000000?text=Hello!%20I\'m%20interested%20in%20your%20products.'
      });
    }
  };

  const generateWhatsAppLink = () => {
    if (!contactInfo) return '#';

    let message = customMessage || contactInfo.message;
    
    if (productName) {
      message = `Hi! I'm interested in ${productName}`;
      if (productUrl) {
        message += `. Product link: ${productUrl}`;
      }
    }

    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = contactInfo.whatsappNumber.replace('+', '');
    
    return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  };

  const handleClick = async () => {
    // Track the inquiry
    if (productName || productUrl) {
      try {
        await fetch('/api/whatsapp/quick-inquiry', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phoneNumber: contactInfo?.whatsappNumber || '+254700000000',
            productName,
            productUrl,
            message: customMessage
          }),
        });
      } catch (error) {
        console.error('Failed to track WhatsApp inquiry:', error);
      }
    }

    // Open WhatsApp
    window.open(generateWhatsAppLink(), '_blank');
  };

  const sizeClasses = {
    sm: 'text-sm px-3 py-2',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-3'
  };

  const variantClasses = {
    floating: 'fixed bottom-6 right-6 z-50 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105',
    inline: 'rounded-lg'
  };

  if (!contactInfo) {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      className={`
        bg-green-500 hover:bg-green-600 text-white font-semibold
        flex items-center gap-2 transition-all duration-200
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      title="Chat with us on WhatsApp"
    >
      <FaWhatsapp className={size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-2xl'} />
      {variant === 'inline' && (
        <span>
          {productName ? 'Ask about this product' : 'Chat on WhatsApp'}
        </span>
      )}
    </button>
  );
}