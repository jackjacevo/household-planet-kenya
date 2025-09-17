'use client';

import { useState } from 'react';
import { ExpiryNotice, ItemExpiryBadge } from './ExpiryNotice';
import { Button } from './Button';

export function ExpiryDemo() {
  const [showDemo, setShowDemo] = useState(false);

  const demoNotices = [
    {
      type: 'warning' as const,
      message: '⏰ 3 items expiring soon! Don\'t let them slip away.'
    },
    {
      type: 'info' as const,
      message: '🛒 Cart items stay fresh for 48 hours - like your favorite snacks!'
    }
  ];

  const wishlistNotices = [
    {
      type: 'warning' as const,
      message: '✨ 2 wishes fading away! Make them real soon.'
    },
    {
      type: 'info' as const,
      message: '🌈 Wishes have a 48-hour magic window before they float away.'
    }
  ];

  if (!showDemo) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <Button onClick={() => setShowDemo(true)} variant="outline">
          🎭 Preview Expiry Notices
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 bg-gray-50 rounded-lg relative">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Expiry System Demo</h3>
        <Button onClick={() => setShowDemo(false)} variant="ghost" size="sm" className="relative z-10">
          ✕
        </Button>
      </div>
      
      <div>
        <h4 className="font-medium mb-2">Cart Notices:</h4>
        <ExpiryNotice notices={demoNotices} />
      </div>
      
      <div>
        <h4 className="font-medium mb-2">Wishlist Notices:</h4>
        <ExpiryNotice notices={wishlistNotices} />
      </div>
      
      <div>
        <h4 className="font-medium mb-2">Expiry Badges:</h4>
        <div className="flex gap-2 flex-wrap">
          <ItemExpiryBadge expiresIn={47} />
          <ItemExpiryBadge expiresIn={23} />
          <ItemExpiryBadge expiresIn={5} />
          <ItemExpiryBadge expiresIn={1} />
        </div>
      </div>
    </div>
  );
}
