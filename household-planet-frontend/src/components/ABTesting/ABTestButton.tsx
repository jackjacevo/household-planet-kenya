'use client';

import React, { useEffect, useState } from 'react';
import { useABTest } from './ABTestProvider';

interface ABTestButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  experimentType?: string;
  trackingData?: {
    productPrice?: number;
    eventType?: string;
  };
}

export const ABTestButton: React.FC<ABTestButtonProps> = ({
  children,
  onClick,
  className = '',
  experimentType = 'BUTTON_COLOR',
  trackingData,
}) => {
  const { getExperimentConfig, trackConversion, trackAddToCart } = useABTest();
  const [buttonConfig, setButtonConfig] = useState<any>(null);
  const [experimentId, setExperimentId] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      const config = await getExperimentConfig(experimentType);
      if (config) {
        setButtonConfig(config.config);
        setExperimentId(config.experimentId);
      }
    };

    loadConfig();
  }, [experimentType, getExperimentConfig]);

  const handleClick = () => {
    onClick();

    // Track the click event
    if (experimentId) {
      if (trackingData?.eventType === 'add_to_cart' && trackingData.productPrice) {
        trackAddToCart(experimentId, trackingData.productPrice);
      } else {
        trackConversion(experimentId, 'button_click');
      }
    }
  };

  const buttonStyle = buttonConfig ? {
    backgroundColor: buttonConfig.buttonColor || '#3B82F6',
    color: buttonConfig.textColor || 'white',
    ...buttonConfig.customStyles,
  } : {};

  const buttonText = buttonConfig?.buttonText || children;

  return (
    <button
      onClick={handleClick}
      className={`px-6 py-3 rounded-lg font-semibold transition-colors duration-200 hover:opacity-90 ${className}`}
      style={buttonStyle}
    >
      {buttonText}
    </button>
  );
};