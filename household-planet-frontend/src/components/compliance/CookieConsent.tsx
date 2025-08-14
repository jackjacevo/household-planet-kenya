'use client';

import { useState, useEffect } from 'react';

interface CookieConsents {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consents, setConsents] = useState<CookieConsents>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = async () => {
    const allConsents = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    await saveConsents(allConsents);
  };

  const handleAcceptSelected = async () => {
    await saveConsents(consents);
  };

  const handleRejectAll = async () => {
    const minimalConsents = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    await saveConsents(minimalConsents);
  };

  const saveConsents = async (consentData: CookieConsents) => {
    try {
      await fetch('/api/compliance/cookie-consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consents: consentData }),
      });
      
      localStorage.setItem('cookieConsent', JSON.stringify(consentData));
      setShowBanner(false);
    } catch (error) {
      console.error('Failed to save cookie consent:', error);
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 p-4">
      <div className="max-w-6xl mx-auto">
        {!showDetails ? (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
                <button
                  onClick={() => setShowDetails(true)}
                  className="text-blue-600 underline ml-1"
                >
                  Customize settings
                </button>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRejectAll}
                className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                Reject All
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Accept All
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Cookie Preferences</h3>
            
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <h4 className="font-medium">Necessary Cookies</h4>
                  <p className="text-sm text-gray-600">Essential for website functionality</p>
                </div>
                <input type="checkbox" checked disabled className="w-4 h-4" />
              </div>

              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <h4 className="font-medium">Analytics Cookies</h4>
                  <p className="text-sm text-gray-600">Help us understand website usage</p>
                </div>
                <input
                  type="checkbox"
                  checked={consents.analytics}
                  onChange={(e) => setConsents({...consents, analytics: e.target.checked})}
                  className="w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <h4 className="font-medium">Marketing Cookies</h4>
                  <p className="text-sm text-gray-600">Used for personalized advertisements</p>
                </div>
                <input
                  type="checkbox"
                  checked={consents.marketing}
                  onChange={(e) => setConsents({...consents, marketing: e.target.checked})}
                  className="w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <h4 className="font-medium">Preference Cookies</h4>
                  <p className="text-sm text-gray-600">Remember your settings</p>
                </div>
                <input
                  type="checkbox"
                  checked={consents.preferences}
                  onChange={(e) => setConsents({...consents, preferences: e.target.checked})}
                  className="w-4 h-4"
                />
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Back
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handleRejectAll}
                  className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
                >
                  Reject All
                </button>
                <button
                  onClick={handleAcceptSelected}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}