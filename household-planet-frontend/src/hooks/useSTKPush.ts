'use client';

import { useState } from 'react';

interface UseSTKPushProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useSTKPush = ({ onSuccess, onError }: UseSTKPushProps = {}) => {
  const [loading, setLoading] = useState(false);

  const validatePhoneNumber = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\s/g, '');
    return /^(254|0)[17]\d{8}$/.test(cleanPhone);
  };

  const formatPhoneNumber = (phone: string): string => {
    let cleanPhone = phone.replace(/\s/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '254' + cleanPhone.substring(1);
    }
    return cleanPhone;
  };

  const initiateSTKPush = async (orderId: number, phoneNumber?: string) => {
    let phone = phoneNumber;
    
    if (!phone) {
      phone = prompt('Enter M-Pesa phone number (e.g., 254700000000 or 0700000000):');
      if (!phone) return;
    }

    if (!validatePhoneNumber(phone)) {
      const errorMsg = 'Please enter a valid Kenyan phone number (e.g., 254700000000 or 0700000000)';
      onError?.(errorMsg);
      alert(errorMsg);
      return;
    }

    const formattedPhone = formatPhoneNumber(phone);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/admin/stk-push`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          orderId, 
          phoneNumber: formattedPhone 
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        const successMsg = 'STK Push sent successfully! Please check your phone and enter your M-Pesa PIN.';
        alert(successMsg);
        onSuccess?.();
        return { success: true, message: successMsg };
      } else {
        const errorMsg = data.message || 'Failed to send STK Push. Please try again.';
        onError?.(errorMsg);
        alert(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (error) {
      console.error('Error initiating STK Push:', error);
      const errorMsg = 'Failed to send STK Push. Please check your connection and try again.';
      onError?.(errorMsg);
      alert(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return {
    initiateSTKPush,
    loading,
    validatePhoneNumber,
    formatPhoneNumber
  };
};