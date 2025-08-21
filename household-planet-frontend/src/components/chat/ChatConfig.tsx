'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function ChatConfig() {
  const { user } = useAuth();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Tawk_API) {
      // Set user information when available
      if (user) {
        window.Tawk_API.setAttributes({
          'name': user.name || 'Customer',
          'email': user.email || '',
          'userId': user.id?.toString() || ''
        });
      }

      // Configure automated responses
      window.Tawk_API.onLoad = function() {
        // Set business hours
        window.Tawk_API.setAttributes({
          'businessHours': 'Mon-Sat: 8AM - 6PM EAT'
        });
      };

      // Handle offline messages
      window.Tawk_API.onOfflineSubmit = function(data: any) {
        console.log('Offline message submitted:', data);
      };
    }
  }, [user]);

  return null;
}