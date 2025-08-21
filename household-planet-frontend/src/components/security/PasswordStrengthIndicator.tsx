'use client';

import { useState, useEffect } from 'react';
import { SecurityUtils } from '@/lib/security';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export function PasswordStrengthIndicator({ password, className = '' }: PasswordStrengthIndicatorProps) {
  const [strength, setStrength] = useState({ score: 0, feedback: [] as string[] });

  useEffect(() => {
    if (password) {
      setStrength(SecurityUtils.checkPasswordStrength(password));
    } else {
      setStrength({ score: 0, feedback: [] });
    }
  }, [password]);

  const getStrengthColor = (score: number) => {
    if (score <= 1) return 'bg-red-500';
    if (score <= 2) return 'bg-orange-500';
    if (score <= 3) return 'bg-yellow-500';
    if (score <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = (score: number) => {
    if (score <= 1) return 'Very Weak';
    if (score <= 2) return 'Weak';
    if (score <= 3) return 'Fair';
    if (score <= 4) return 'Good';
    return 'Strong';
  };

  if (!password) return null;

  return (
    <div className={`mt-2 ${className}`}>
      <div className="flex items-center space-x-2 mb-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(strength.score)}`}
            style={{ width: `${(strength.score / 5) * 100}%` }}
          />
        </div>
        <span className={`text-sm font-medium ${
          strength.score <= 2 ? 'text-red-600' : 
          strength.score <= 3 ? 'text-yellow-600' : 
          strength.score <= 4 ? 'text-blue-600' : 'text-green-600'
        }`}>
          {getStrengthText(strength.score)}
        </span>
      </div>
      
      {strength.feedback.length > 0 && (
        <ul className="text-xs text-gray-600 space-y-1">
          {strength.feedback.map((item, index) => (
            <li key={index} className="flex items-center space-x-1">
              <span className="text-red-500">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}