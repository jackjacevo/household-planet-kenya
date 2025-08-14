'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface ABTestConfig {
  experimentId: string;
  variantName: string;
  config: any;
}

interface ABTestContextType {
  getExperimentConfig: (type: string) => ABTestConfig | null;
  trackConversion: (experimentId: string, eventType: string, eventValue?: number) => void;
  trackPurchase: (experimentId: string, orderValue: number) => void;
  trackAddToCart: (experimentId: string, productPrice: number) => void;
}

const ABTestContext = createContext<ABTestContextType | null>(null);

export const useABTest = () => {
  const context = useContext(ABTestContext);
  if (!context) {
    throw new Error('useABTest must be used within ABTestProvider');
  }
  return context;
};

interface ABTestProviderProps {
  children: React.ReactNode;
  userId?: string;
}

export const ABTestProvider: React.FC<ABTestProviderProps> = ({ children, userId }) => {
  const [experiments, setExperiments] = useState<Map<string, ABTestConfig>>(new Map());
  const [sessionId] = useState(() => 
    typeof window !== 'undefined' 
      ? sessionStorage.getItem('ab-session-id') || generateSessionId()
      : generateSessionId()
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('ab-session-id', sessionId);
    }
  }, [sessionId]);

  const getExperimentConfig = async (type: string): Promise<ABTestConfig | null> => {
    if (experiments.has(type)) {
      return experiments.get(type) || null;
    }

    try {
      const response = await fetch(
        `/api/ab-testing/experiment/${type}/config?userId=${userId || ''}&sessionId=${sessionId}`
      );
      
      if (!response.ok) return null;
      
      const config = await response.json();
      if (config) {
        setExperiments(prev => new Map(prev).set(type, config));
        return config;
      }
    } catch (error) {
      console.error('Failed to get experiment config:', error);
    }

    return null;
  };

  const trackConversion = async (experimentId: string, eventType: string, eventValue?: number) => {
    try {
      await fetch('/api/ab-testing/track/conversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experimentId,
          userId,
          sessionId,
          eventType,
          eventValue,
        }),
      });
    } catch (error) {
      console.error('Failed to track conversion:', error);
    }
  };

  const trackPurchase = async (experimentId: string, orderValue: number) => {
    try {
      await fetch('/api/ab-testing/track/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experimentId,
          userId,
          sessionId,
          orderValue,
        }),
      });
    } catch (error) {
      console.error('Failed to track purchase:', error);
    }
  };

  const trackAddToCart = async (experimentId: string, productPrice: number) => {
    try {
      await fetch('/api/ab-testing/track/add-to-cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experimentId,
          userId,
          sessionId,
          productPrice,
        }),
      });
    } catch (error) {
      console.error('Failed to track add to cart:', error);
    }
  };

  const contextValue: ABTestContextType = {
    getExperimentConfig: (type: string) => experiments.get(type) || null,
    trackConversion,
    trackPurchase,
    trackAddToCart,
  };

  // Initialize experiments on mount
  useEffect(() => {
    const initializeExperiments = async () => {
      const experimentTypes = ['BUTTON_COLOR', 'LAYOUT', 'CONTENT', 'PRICING', 'CHECKOUT'];
      
      for (const type of experimentTypes) {
        await getExperimentConfig(type);
      }
    };

    initializeExperiments();
  }, [userId, sessionId]);

  return (
    <ABTestContext.Provider value={contextValue}>
      {children}
    </ABTestContext.Provider>
  );
};

function generateSessionId(): string {
  return 'session_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}