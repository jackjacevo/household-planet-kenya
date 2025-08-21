'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: Date;
  }
}

export function LiveChat() {
  useEffect(() => {
    // Tawk.to configuration
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    // Create script element
    const script = document.createElement('script');
    script.async = true;
    const propertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID || 'YOUR_TAWK_PROPERTY_ID';
    const widgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID || 'YOUR_TAWK_WIDGET_ID';
    script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');

    // Add script to document
    const firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode?.insertBefore(script, firstScript);

    // Wait for Tawk.to to load before setting attributes
    window.Tawk_API.onLoad = function() {
      // Customize chat widget
      window.Tawk_API.customStyle = {
        visibility: {
          desktop: {
            position: 'br',
            xOffset: 20,
            yOffset: 20
          },
          mobile: {
            position: 'br',
            xOffset: 10,
            yOffset: 80
          }
        }
      };

      // Set visitor attributes after widget loads
      window.Tawk_API.setAttributes({
        'name': 'Household Planet Customer',
        'email': '',
        'hash': ''
      }, function(error: any) {
        if (error) {
          console.error('Tawk.to error:', error);
        }
      });
    };

    return () => {
      // Cleanup
      const tawkScript = document.querySelector('script[src*="tawk.to"]');
      if (tawkScript) {
        tawkScript.remove();
      }
    };
  }, []);

  return null;
}